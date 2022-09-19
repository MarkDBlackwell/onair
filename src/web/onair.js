/*
Copyright (C) 2022 Mark D. Blackwell.
  All rights reserved.
  This program is distributed in the hope that it will be useful,
  but WITHOUT ANY WARRANTY; without even the implied warranty of
  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
*/

'use strict';

(function() {
    const functionDealWithAirSchedule = function() {
        const httpRequest = new XMLHttpRequest();
        const objectForBindingTimeoutHandlers = new Object();

        let digestPrevious = '';
        let minuteOfWeekUtcCurrent;
        let minuteOfWeekUtcNext;
        let webSocket;
        let webSocketMode = 'initial';
        let webSocketNextCheckDelaySeconds;

        const functionMinuteOfWeekUtcNow = function(timeNow) {
            const daysPerWeek = 7;
            // In this program, the first day of the week is Monday.
            const dayOfWeek = (timeNow.getUTCDay() + daysPerWeek - 1) % daysPerWeek;
            const dayOfMonth = timeNow.getUTCDate();

            const volatile = new Date(timeNow.getTime());
            volatile.setUTCDate(dayOfMonth - dayOfWeek);
            volatile.setUTCHours(0);
            volatile.setUTCMinutes(0);
            volatile.setUTCSeconds(0);
            volatile.setUTCMilliseconds(0);
            const timeWeekBeginning = volatile;
            {
                const millisecondsPerSecond = 1000;
                const secondsPerMinute = 60;
                const timeOfWeek = timeNow - timeWeekBeginning;
                const minute = Math.floor(timeOfWeek / millisecondsPerSecond / secondsPerMinute);
                return minute;
            };
        };

        const functionTimeNow = function() {
            const result = new Date();
            //console.debug('result ' + result);
            return result;
        };

        const functionHandleTimeoutExpirationSchedule = function() {
            let httpResponseArray = JSON.parse(httpRequest.responseText);
            const slotsMinuteOfWeekUtc = httpResponseArray.at(1);
            const descriptionsIndexes  = httpResponseArray.at(2);
            const descriptions         = httpResponseArray.at(3);
            httpResponseArray = void 0;

            const slotsCount = slotsMinuteOfWeekUtc.length;
            //console.debug(functionTimestamp() + 'first description: ' + descriptions.at(0));

            // Obtain the current time.
            const timeNow = functionTimeNow();
            //console.debug(functionTimestamp() + 'time now ' + timeNow);

            // Obtain the current minute of the UTC week.
            const minuteOfWeekUtcNow = functionMinuteOfWeekUtcNow(timeNow);
            //console.debug(functionTimestamp() + 'now minute ' + minuteOfWeekUtcNow);

            // Obtain the index in the UTC week of the next slot.
            const slotIndexNext = (function() {
                // Find the first slot after the current time.
                const functionAfterNow = function(element) {
                    return element > minuteOfWeekUtcNow;
                };

                const index = slotsMinuteOfWeekUtc.findIndex(functionAfterNow);
                //console.debug(functionTimestamp() + 'slot index ' + index + '/' + slotsCount);
                {
                    const notFound = -1;
                    if (notFound == Math.sign(index)) {
                        const theFirstSlot = 0;
                        return theFirstSlot;
                    };
                };
                return index;
            })();
            //console.debug(functionTimestamp() + 'next slot index ' + slotIndexNext + '/' + slotsCount);

            // Program the clock for the next slot.
            {
                const daysPerWeek = 7;
                const hoursPerDay = 24;
                const millisecondsPerSecond = 1000;
                const minutesPerHour = 60;
                const oneSecondInMilliseconds = 1000;
                const secondsPerMinute = 60;

                const millisecondsPerMinute = secondsPerMinute * millisecondsPerSecond;
                const minutesPerWeek = daysPerWeek * hoursPerDay * minutesPerHour;

                minuteOfWeekUtcNext = slotsMinuteOfWeekUtc.at(slotIndexNext);
                {
                    const delayMinutes = (minuteOfWeekUtcNext - minuteOfWeekUtcNow + minutesPerWeek) % minutesPerWeek;
                    const delayMilliseconds = delayMinutes * millisecondsPerMinute + oneSecondInMilliseconds;

                    // At the start of the next slot, change the display.
                    setTimeout(function(){objectForBindingTimeoutHandlers.functionHandleTimeoutExpirationSchedule()}, delayMilliseconds);
                };
            };

            // Obtain the next slot's minute in the local-time day.
            // Because this is changed below, it must be 'let', not 'const'.
            let minuteOfDayLocal = (function() {
                const hoursPerDay = 24;
                const minutesPerHour = 60;
                const minutesPerDay = hoursPerDay * minutesPerHour;
                const timeLocalAddendMinutes = - timeNow.getTimezoneOffset();
                const minuteOfWeekLocal = minuteOfWeekUtcNext + timeLocalAddendMinutes;

                const result = (minuteOfWeekLocal + minutesPerDay) % minutesPerDay;
                return result;
            })();
            //console.debug(functionTimestamp() + 'minuteOfDayLocal ' + minuteOfDayLocal);

            // Accommodate the meridian.
            const meridian = (function() {
                const hoursPerDay = 24;
                const minutesPerHour = 60;

                const minutesPerDay = hoursPerDay * minutesPerHour;
                const minutesPerDayHalf = minutesPerDay / 2;

                if (minuteOfDayLocal >= minutesPerDayHalf) {
                    minuteOfDayLocal -= minutesPerDayHalf;
                    return 'PM';
                };
                return 'AM';
            })();
            //console.debug(functionTimestamp() + 'meridian ' + meridian);

            // Calculate the hour.
            const hourString = (function() {
                const minutesPerHour = 60;
                const hourMeridian = Math.floor(minuteOfDayLocal / minutesPerHour);
                {
                    const midnightOrNoon = 0;
                    if (midnightOrNoon == hourMeridian) {
                        return '12';
                    };
                };
                return hourMeridian.toString();
            })();
            //console.debug(functionTimestamp() + 'hourString ' + hourString);

            // Calculate the minute.
            const minuteString = (function() {
                const minutesPerHour = 60;
                const minuteOfHour = minuteOfDayLocal % minutesPerHour;
                {
                    const topOfHour = 0;
                    if (topOfHour == minuteOfHour) {
                        return '';
                    };
                };
                const fullyExpressed = ':' + minuteOfHour.toString().padStart(2, '0');
                return fullyExpressed;
            })();
            //console.debug(functionTimestamp() + 'minuteString \'' + minuteString + '\'');

            // Set the nodes.
            {
                const functionSetNode = function(id, innerHtml) {
                    const node = document.getElementById(id);
                    node.innerHTML = innerHtml;
                };

                const functionSetDescription = function(id, index) {
                    const description = descriptions.at(descriptionsIndexes.at(index));
                    //console.debug(functionTimestamp() + 'description ' + description);

                    functionSetNode(id, description);
                };

                // Set the time node.
                {
                    const time = hourString + minuteString + '&nbsp;' + meridian;
                    //console.debug(functionTimestamp() + 'time ' + time);

                    functionSetNode('time', time);
                };

                // Set the next slot's node.
                functionSetDescription('next', slotIndexNext);

                // Set the current slot's node.
                {
                    const raw = slotIndexNext - 1;
                    const slotIndexCurrent = (raw + slotsCount) % slotsCount;

                    functionSetDescription('now', slotIndexCurrent);

                    // Remember the current minute of the week.
                    minuteOfWeekUtcCurrent = slotsMinuteOfWeekUtc.at(slotIndexCurrent);
                };
            };
        };

        objectForBindingTimeoutHandlers.functionHandleTimeoutExpirationSchedule = function() {
            functionHandleTimeoutExpirationSchedule();
        };

        const functionHandleTimeoutExpirationWebSocket = function() {
            webSocketNextCheckDelaySeconds *= 3;
            functionWebSocketConnect();
        };

        objectForBindingTimeoutHandlers.functionHandleTimeoutExpirationWebSocket = function() {
            functionHandleTimeoutExpirationWebSocket();
        };

        const functionHttpRequestOnLoad = function() {

            // Process the server response here.
            try {
                //console.debug(functionTimestamp() + 'Status ' + httpRequest.status);
                if (200 != httpRequest.status) {
                    // There was a problem with the request.
                    // For example, the response may have a 404 (Not Found)
                    // or 500 (Internal Server Error) response code.
                    return;
                };

                // The response status was perfect!
                // Browsers present to JavaScript all responses that are 304 (Not Modified) as 200 (OK).
                // See if the data has changed.
                {
                    //console.debug(functionTimestamp() + 'Response text: ' + httpRequest.responseText);

                    const regex = /^\["([^"]*)",/
                    const digest = httpRequest.responseText.match(regex).at(1);
                    //console.debug(functionTimestamp() + 'Digest: ' + digest);

                    const digestHasChanged = digestPrevious != digest;
                    //console.debug(functionTimestamp() + 'digestHasChanged ' + digestHasChanged);

                    let hasReasonToRecalculate;

                    if (digestHasChanged) {
                        hasReasonToRecalculate = true;
                    } else {

                        // Is the "now" UTC minute still between the "current" and "next" slots' UTC minutes?
                        const functionIsBetween = function(first, now, second) {
                            if (now == first) {
                                return true;
                            };

                            if (now == second) {
                                return false;
                            };

                            const three = new Array(first, now, second);
                            const max = Math.max(...three);
                            const min = Math.min(...three);
                            {
                                const wrappedAround = second < first;
                                if (wrappedAround) {
                                    return now == min ||
                                           now == max;
                                };
                            };
                            return min == first &&
                                   max == second;
                        };

                        // Obtain the current time.
                        const timeNow = functionTimeNow();

                        // Obtain the current minute of the UTC week.
                        const minuteOfWeekUtcNow = functionMinuteOfWeekUtcNow(timeNow);

                        const nowInRange = functionIsBetween(minuteOfWeekUtcCurrent, minuteOfWeekUtcNow, minuteOfWeekUtcNext);
                        //console.debug(functionTimestamp() + 'nowInRange ' + nowInRange);

                        hasReasonToRecalculate = ! nowInRange;
                    };
                    //console.debug(functionTimestamp() + 'hasReasonToRecalculate ' + hasReasonToRecalculate);

                    if (hasReasonToRecalculate) {
                        digestPrevious = digest;
                        // Immediately recalculate and display the current and next slots in the schedule.
                        functionHandleTimeoutExpirationSchedule();
                    };
                };
            } catch (error) {
                // An exception was caught.
                return;
            };
        };

        const functionHttpRequestOpenSend = function() {
            httpRequest.open('GET', 'schedule.json');
            // Here, don't set header 'Cache-Control: no-cache'.
            // Let the server handle that functionality.
            httpRequest.send();
        };

        const functionTimestamp = function() {
            const now = functionTimeNow();
            const stamp = now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds() + ' onair: ';
            return stamp;
        };

        const functionWebSocketConnect = function() {

            const functionWebSocketDisplay = function(event) {
                const all = functionTimestamp() +
                  'Mode ' + webSocketMode +
                  ', ReadyState ' + webSocket.readyState +
                  ', Delay ' + webSocketNextCheckDelaySeconds +
                  ', EventCode ' + event.code;
                console.info(all);
            };

            const functionWebSocketOnClose = function(event) {
                const open_communicating = 1;
                if (open_communicating != webSocket.readyState) {
                    if ('polling' != webSocketMode) {
                        webSocketNextCheckDelaySeconds = 5;
                    };

                    webSocketMode = 'polling';
                    // Check again, after an ever-increasing length of time.
                    {
                        const oneSecondInMilliseconds = 1000;
                        const delayMilliseconds = webSocketNextCheckDelaySeconds * oneSecondInMilliseconds;
                        setTimeout(function(){objectForBindingTimeoutHandlers.functionHandleTimeoutExpirationWebSocket()}, delayMilliseconds);
                    };
                };

                functionWebSocketDisplay(event);
            };

            const functionWebSocketOnOpen = function(event) {
                const open_communicating = 1;
                if (open_communicating == webSocket.readyState) {
                    if ('initial' != webSocketMode) {
                        functionHttpRequestOpenSend();
                    };

                    webSocketMode = 'drifting';
                    webSocketNextCheckDelaySeconds = void 0;
                };

                functionWebSocketDisplay(event);
            };

            const subProtocol = 'FUJH9i00YlfhAE2W0gsl';
            const urlWebsocket = new URL(document.URL);

            urlWebsocket.pathname = '/schedule';
            urlWebsocket.port = '8080';
            urlWebsocket.protocol = 'wss:';

            try {
                // No 'open' method exists; so, we must create a new WebSocket object each time.
                webSocket = new WebSocket(urlWebsocket.href, subProtocol);
                webSocket.onclose = function(event){functionWebSocketOnClose(event)};
                webSocket.onopen  = function(event){functionWebSocketOnOpen( event)};
            } catch (error) {
                console.error(functionTimestamp(), error);
            };
        };

        if (! httpRequest) {
            // Could not create an XmlHttp instance.
            return;
        };

        httpRequest.onload = function(){functionHttpRequestOnLoad()};
        functionHttpRequestOpenSend();
        functionWebSocketConnect();
    };

    functionDealWithAirSchedule();
})();
