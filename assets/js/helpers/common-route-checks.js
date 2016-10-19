
export function ifTensideNotOkRedirectToInstall(results, routing) {
    if (false === results['tenside_configured']
        || false === results['project_created']
        || false === results['project_installed']
    ) {
        routing.redirect('install');
        return false;
    }

    return true;
}

export function ifUserNotLoggedInRedirectToLogin(results, routing) {
    if (false === results['user_loggedIn']) {
        routing.redirect('login');
        return false;
    }

    return true;
}

export default [ifTensideNotOkRedirectToInstall, ifUserNotLoggedInRedirectToLogin];
