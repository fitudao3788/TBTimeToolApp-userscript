// ==UserScript==
// @name         TBTimeToolApp
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  TechnoBlood TimeTool App for userscript
// @author       fitudao3788
// @match        https://www.paynetcafe.com/contents/timetool/*
// @match        https://www.paynetcafe.com/contents/timetoolapp/*
// @match        https://www.paynetcafe.com/contents/TimeToolApp/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=www.paynetcafe.com
// @grant        unsafeWindow
// @require      https://cdn.jsdelivr.net/npm/bowser@2.14.1/es5.min.js
// @require      https://cdn.jsdelivr.net/npm/md5@2.3.0/dist/md5.min.js
// @run-at       document-start
// ==/UserScript==

(function() {
    'use strict';

    function generateMacAddr() {
        const chars = '0123456789ABCDEF';
        const blocks = [];

        for (let i = 0; i < 6; i++) {
            let block = '';
            block += chars[Math.floor(Math.random() * chars.length)];
            block += chars[Math.floor(Math.random() * chars.length)];
            blocks.push(block);
        }
        return blocks.join('-');
    }

    function generateClientKey() {
        const browser = bowser.getParser(window.navigator.userAgent, window.navigator.userAgentData);

        const platformInfo = browser.getOSName() + "." + browser.getOSVersion();
        const deviceInfo = browser.getBrowserName();
        let macAddr = localStorage.getItem("TB_mac_addr");
        if (!macAddr) {
            macAddr = generateMacAddr();
            localStorage.setItem("TB_mac_addr", macAddr);
        }

        return platformInfo + "/" + deviceInfo + "/" + macAddr;
    }

    unsafeWindow.cefQuery = function({ request, onSuccess, onFailure }) {
        const urlWithoutQuery = request.split("?")[0]

        switch (urlWithoutQuery) {
            case "tbtimetoolapp://info": {
                onSuccess(generateClientKey());
                return;
            }

            case "tbtimetoolapp://popupWindow": {
                let url = new URL(request);

                onSuccess();
                window.open(url.searchParams.get("url"), "_blank");
                return;
            }

            case "tbtimetoolapp://quit": {
                onSuccess();
                window.close();
                return;
            }

            case "tbtimetoolapp://started":
            case "tbtimetoolapp://ended":
            case "tbtimetoolapp://monitor": {
                onSuccess();
                return;
            }
        }
    }

    if(location.host == "www.paynetcafe.com" && location.pathname == "/contents/TimeToolApp/launch") {
        const observer = new MutationObserver((mutations, obs) => {
            if (unsafeWindow.PageData) {
                unsafeWindow.PageData.noInit = true;

                const appVersion = "1.0.2.0";
                const hash2 = MD5(unsafeWindow.PageData.gameID + unsafeWindow.PageData.userID + unsafeWindow.PageData.tStamp + unsafeWindow.PageData.hash + appVersion);

                const uri = new URL("https://www.paynetcafe.com/contents/timetoolapp/start");
                uri.searchParams.set("gameID", unsafeWindow.PageData.gameID);
                uri.searchParams.set("userID", unsafeWindow.PageData.userID);
                uri.searchParams.set("hash2", hash2);
                uri.searchParams.set("version", appVersion);
                uri.searchParams.set("tStamp", unsafeWindow.PageData.tStamp);
                uri.searchParams.set("hash", unsafeWindow.PageData.hash);
                uri.searchParams.set("browser", navigator.userAgent);

                location.href = uri.toString();

                obs.disconnect();
            }
        });

        observer.observe(document.documentElement, {
            childList: true,
            subtree: true
        });
    }
})();
