const defaultOptions = {
    timeout: 5000,
    jsonpCallback: 'callback',
    jsonpCallbackFunction: null,
};

function generateCallbackFunction() {
    return `jsonp_${Date.now()}_${Math.ceil(Math.random() * 100000)}`;
}

function clearFunction(functionName) {
    // IE8 throws an exception when you try to delete a property on window
    // http://stackoverflow.com/a/1824228/751089
    try {
        delete window[functionName];
    } catch (e) {
        window[functionName] = undefined;
    }
}

function removeScript(scriptId) {
    const script = document.getElementById(scriptId);
    if (script) {
        document.getElementsByTagName('head')[0].removeChild(script);
    }
}

function fetchJsonp(_url, options = {}) {
    // to avoid param reassign
    let url = _url;
    const timeout = options.timeout || defaultOptions.timeout;
    const jsonpCallback = options.jsonpCallback || defaultOptions.jsonpCallback;

    let timeoutId;

    return new Promise((resolve, reject) => {
        const callbackFunction = options.jsonpCallbackFunction || generateCallbackFunction();
        const scriptId = `${jsonpCallback}_${callbackFunction}`;

        window[callbackFunction] = (response) => {
            resolve({
                ok: true,
                // keep consistent with fetch API
                json: () => Promise.resolve(response),
            });

            if (timeoutId) clearTimeout(timeoutId);

            removeScript(scriptId);

            clearFunction(callbackFunction);
        };

        // Check if the user set their own params, and if not add a ? to start a list of params
        url += (url.indexOf('?') === -1) ? '?' : '&';

        const jsonpScript = document.createElement('script');
        jsonpScript.setAttribute('src', `${url}${jsonpCallback}=${callbackFunction}`);
        if (options.charset) {
            jsonpScript.setAttribute('charset', options.charset);
        }
        jsonpScript.id = scriptId;
        document.getElementsByTagName('head')[0].appendChild(jsonpScript);

        timeoutId = setTimeout(() => {
            reject(new Error(`JSONP request to ${_url} timed out`));

            clearFunction(callbackFunction);
            removeScript(scriptId);
            window[callbackFunction] = () => {
                clearFunction(callbackFunction);
            };
        }, timeout);

        // Caught if got 404/500
        jsonpScript.onerror = () => {
            reject(new Error(`JSONP request to ${_url} failed`));

            clearFunction(callbackFunction);
            removeScript(scriptId);
            if (timeoutId) clearTimeout(timeoutId);
        };
    });
}

const providers = {
    twitter: {
        countUrl: 'https://opensharecount.com/count.json?url={url}',
        postUrl: 'https://twitter.com/intent/tweet?url={url}&via=geowarin&text={title}',
        getCount: function (result) {
            return result && result.count;
        }
    },
    linkedIn: {
        countUrl: 'https://www.linkedin.com/countserv/count/share?format=jsonp&url={url}',
        postUrl: 'https://www.linkedin.com/shareArticle?mini=true&url={url}&title={title}',
        jsonp: true,
        getCount: function (result) {
            return result.count;
        }
    },
    facebook: {
        countUrl: 'https://graph.facebook.com/?id={url}',
        postUrl: 'https://www.facebook.com/sharer/sharer.php?u={url}&t={title}',
        getCount: function (result) {
            return result.share.share_count;
        }
    },
    google: {
        countUrl: null,
        postUrl: 'https://plus.google.com/share?&url={url}',
    }
};

let links = document.querySelectorAll('.article-share-links');
for (let i = 0; i < links.length; i++) {
    const $links = links[i];
    const articleUrl = $links.getAttribute('data-url');
    const articleTitle = $links.getAttribute('data-title');

    const shareButtons = $links.querySelectorAll('a');
    for (let j = 0; j < shareButtons.length; j++) {

        const linkElement = shareButtons[j];
        const linkProvider = linkElement.getAttribute('data-provider');
        const provider = providers[linkProvider];

        if (!provider) {
            continue;
        }

        const href = provider.postUrl
            .replace('{url}', articleUrl)
            .replace('{title}', articleTitle);
        linkElement.setAttribute('href', href);
        linkElement.addEventListener('click', () => !window.open(href, 'article-share-box-window-' + Date.now(), 'width=500,height=450'));

        if (provider.countUrl) {
            const url = provider.countUrl.replace('{url}', articleUrl);
            console.log(url);
            const fetchPromise = provider.jsonp ? fetchJsonp(url) : fetch(url);

            fetchPromise
                .then(r => r.json())
                .then(result => {
                    const count = provider.getCount(result);
                    console.log("count", url, count);
                    linkElement.querySelector('.count').innerHTML = count;
                });
        }
    }
}
