<template>
    <main-layout>

        <section :class="{'package-tools': true, 'package-tools--search': $route.name === 'packages-search'}">
            <button class="package-tools__button package-tools__button--update widget-button" :disabled="hasChanges" @click="updatePackages">{{ 'ui.packages.updateButton' | translate }}</button>
            <button class="package-tools__button package-tools__button--search widget-button" :disabled="hasChanges" @click="startSearch">{{ 'ui.packages.searchButton' | translate }}</button>
            <input class="package-tools__search" ref="search" id="search" type="text" :placeholder="$t('ui.packages.searchPlaceholder')" autocomplete="off" v-model="searchInput" @keypress.esc.prevent="stopSearch" @keyup="search">
            <button class="package-tools__cancel" @click="stopSearch">X</button>
        </section>

        <router-view ref="component" @changed="setHasChanges" :searchField="$refs.search"></router-view>

        <div id="package-actions" :class="{ active: hasChanges }">
            <div class="inner">
                <p>{{ 'ui.packages.changesMessage' | translate }}</p>
                <button class="widget-button widget-button--primary" @click="applyChanges">{{ 'ui.packages.changesApply' | translate }}</button>
                <button class="widget-button widget-button--alert" @click="resetChanges">{{ 'ui.packages.changesReset' | translate }}</button>
            </div>
        </div>

    </main-layout>
</template>

<script>
    import routes from '../../router/routes';

    import MainLayout from '../layouts/Main';

    export default {
        components: { MainLayout },
        data: () => ({
            hasChanges: false,
            searchInput: '',
        }),
        methods: {
            updatePackages() {
                if (!confirm(this.$t('ui.packages.updateConfirm'))) {
                    return;
                }

                this.$store.dispatch(
                    'tasks/execute',
                    {
                        type: 'upgrade',
                    },
                ).then(
                    () => {
                        this.$emit('changed', false);
                        this.listPackages();
                    },
                );
            },
            startSearch() {
                this.$router.push(routes.packagesSearch);
            },
            stopSearch() {
                this.searchInput = '';
                this.$router.push(routes.packages);
            },
            search() {
                if (this.$route.name === routes.packagesSearch.name) {
                    this.$router.push(
                        Object.assign(
                            { query: { q: this.searchInput } },
                            routes.packagesSearch,
                        ),
                    );
                }
            },
            setHasChanges(value) {
                this.hasChanges = value;
            },
            applyChanges() {
                this.$refs.component.applyChanges();
            },
            resetChanges() {
                this.$refs.component.resetChanges();
            },
        },
        watch: {
            $route(route) {
                this.hasChanges = false;

                if (route.name !== routes.packagesSearch.name) {
                    this.searchInput = '';
                }
            },
        },
    };
</script>


<style rel="stylesheet/scss" lang="scss">
    @import "../../assets/styles/defaults";

    .package-tools {
        position: relative;
        margin-bottom: 40px;
        text-align: center;

        &__button {
            &.widget-button {
                height: 38px;
                margin-bottom: 10px;
                line-height: 36px;
                border: 1px solid $border-color;
            }

            &:before {
                position: relative;
                display: inline-block;
                top: 4px;
                width: 18px;
                height: 18px;
                margin-right: 8px;
                background-size: 22px 22px;
                content: "";
            }

            &--update:before {
                background: url('../../assets/images/update.svg') center center no-repeat;
            }

            &--search:before {
                background: url('../../assets/images/search-invert.svg') center center no-repeat;
            }
        }

        &__cancel {
            display: none;
            position: absolute;
            top: 48px;
            right: 10px;
            width: 38px;
            height: 38px;
            margin: 0;
            color: $text-color;
            border: none;
            background: none;

            @include screen(1024) {
                top: 0;
            }
        }

        &__search {
            display: none;
            margin-bottom: 10px;
            padding-right: 40px;
        }

        &--search {
            .package-tools {
                &__search {
                    display: block;
                }

                &__button--search {
                    display: none;

                    @include screen(1024) {
                        display: inline-block;
                    }
                }

                &__cancel {
                    display: block;
                }
            }
        }

        @include screen(1024) {
            &__button.widget-button {
                width: 200px;
                margin: 0 15px;
            }

            &__search {
                position: absolute !important;
                top: 0;
                right: 0;
                width: 50% !important;
            }
        }
    }

    #package-actions {
        position: fixed;
        overflow: hidden;
        left: 0;
        right: 0;
        bottom: 0;
        height: 0;
        background: #000;
        background: rgba(0,0,0, 0.8);
        color: #fff;
        transition: height .4s ease;
        z-index: 100;

        &.active {
            height: 80px;
        }

        .inner {
            margin: 0 20px;
            padding: 20px 0;
            text-align: right;

            @include screen(1024) {
                max-width: 960px;
                margin: 0 auto;
            }

            @include screen(1200) {
                max-width: 1180px;
            }
        }

        p {
            display: none;

            @include screen(600) {
                display: inline;
                font-weight: $font-weight-bold;
            }
        }

        button {
            width: calc(50% - 10px);
            padding: 0 15px;

            &:last-child {
                margin-left: 16px;
            }

            @include screen(600) {
                width: auto;
                margin-left: 16px;
            }
        }
    }

</style>
