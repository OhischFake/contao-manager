/* eslint-disable no-param-reassign */

import api from '../api';

const statusMap = {
    started: 'running',
    terminated: 'success',
    error: 'error',
};

const pollTask = ({ commit }, resolve, reject) => {
    let pending = 0;

    const fetch = () => {
        api.getTask().then(
            (task) => {
                commit('setProgress', task);

                switch (task.status) {
                    case 'ready':
                    default:
                        pending += 1;

                        if (pending > 5) {
                            commit('setStatus', 'failed');
                            reject(task);
                            return;
                        }

                        api.runTask(pending * 500).then(() => {
                            setTimeout(fetch, pending * 1000);
                        });
                        break;

                    case 'RUNNING': // @deprecated: BC for self-update with version < 1.0.0-alpha6
                    case 'started':
                        commit('setStatus', 'running');
                        setTimeout(fetch, 1000);
                        break;

                    case 'FINISHED': // @deprecated: BC for self-update with version < 1.0.0-alpha6
                    case 'terminated':
                        commit('setStatus', 'success');
                        resolve(task);
                        break;

                    case 'error':
                        commit('setStatus', 'error');
                        reject(task);
                        break;
                }
            },
            () => {
                commit('setStatus', null);
                commit('setProgress', null);
                reject();
            },
        );
    };

    setTimeout(fetch, 1000);
};

export default {
    namespaced: true,

    state: {
        status: null,
        type: null,
        consoleOutput: '',
    },

    mutations: {
        setStatus(state, status) {
            state.status = status;
        },
        setProgress(state, progress) {
            if (progress === null) {
                state.type = null;
                state.consoleOutput = '';
            } else {
                state.type = progress.type;
                state.consoleOutput = progress.output;
            }
        },
    },

    actions: {
        reload(store) {
            return new Promise((resolve, reject) => {
                if (store.state.status !== null) {
                    reject();
                }

                api.getTask().then(
                    (task) => {
                        if (task) {
                            if (task.status === 'ready') {
                                api.deleteTask();
                            } else if (task.status === 'finished') {
                                store.commit('setStatus', statusMap[task.status]);
                                store.commit('setProgress', task);
                            } else {
                                store.commit('setStatus', statusMap[task.status] !== undefined ? statusMap[task.status] : 'ready');
                                store.commit('setProgress', task);

                                pollTask(store, resolve, reject);
                                return;
                            }
                        }

                        resolve();
                    },
                );
            });
        },

        run(store) {
            return new Promise((resolve, reject) => {
                if (store.state.status !== null) {
                    reject();
                }

                store.commit('setStatus', 'ready');
                store.commit('setProgress', null);

                pollTask(store, resolve, reject);
            });
        },

        execute(store, task) {
            return new Promise((resolve, reject) => {
                if (store.state.status !== null) {
                    reject();
                }

                store.commit('setStatus', 'ready');
                store.commit('setProgress', task);

                api.addTask(task).then(() => {
                    pollTask(store, resolve, reject);
                });
            });
        },

        stop(store) {
            return new Promise((resolve, reject) => {
                if (store.state.status === null) {
                    reject();
                }

                api.stopTask().then(
                    () => {
                        resolve();
                    },
                    () => {
                        reject();
                    },
                );
            });
        },

        deleteCurrent(store) {
            const deleteTask = () => store.commit('setStatus', null);
            return api.deleteTask().then(deleteTask, deleteTask);
        },
    },
};
