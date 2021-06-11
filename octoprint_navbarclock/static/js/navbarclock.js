/*
 * View model for OctoPrint-NavbarClock
 *
 * Author: Manuel McLure
 * License: AGPLv3
 */
$(function () {
    function NavbarClockViewModel(parameters) {
        var self = this;
        self.settingsViewModel = parameters[0];
        self.timeStr = ko.observable("00:00:00");
        self.serverOffset = 0;
        self.serverTime = null;

        self.clockUpdate = function () {
            var ts;
            var d = new Date();
            var hr;
            var min;
            var sec = d.getUTCSeconds();
            var ampm = "AM";
            if (self.settings.timeZone() == "server") {
                if (sec == 0 || self.serverTime == null) {
                    OctoPrint.simpleApiGet("navbarclock").done(function (response) {
                        self.serverTime = response.server_time;
                        self.serverOffset =
                            self.serverTime.tz_offset +
                            self.serverTime.server_timestamp -
                            Math.trunc(Date.now() / 1000);
                    });
                }
                d.setTime(Date.now() + self.serverOffset * 1000);
            }
            if (self.settings.timeZone() == "browser") {
                var hr = d.getHours();
                var min = d.getMinutes();
                var sec = d.getSeconds();
            } else {
                var hr = d.getUTCHours();
                var min = d.getUTCMinutes();
            }
            if (self.settings.format24h()) {
                if (hr < 10) {
                    hr = "0" + hr;
                }
            } else {
                if (hr == 0) {
                    hr = 12;
                } else if (hr == 12) {
                    ampm = "PM";
                } else if (hr > 12) {
                    hr -= 12;
                    ampm = "PM";
                }
            }
            var min = d.getMinutes();
            if (min < 10) {
                min = "0" + min;
            }
            ts = hr + ":" + min;
            if (self.settings.showSeconds()) {
                if (sec < 10) {
                    sec = "0" + sec;
                }
                ts += ":" + sec;
            }
            if (!self.settings.format24h() && self.settings.showampm()) {
                ts += " " + ampm;
            }
            self.timeStr(ts);
        };

        self.onAllBound = function(){
            // Check for themify - sadly the themeify plugin always sets the "themeify" class on html even though themes are not active so we cant use that as not selector in the css - so we use js :(
            if (OctoPrint.coreui.viewmodels.settingsViewModel.settings.plugins.hasOwnProperty('themeify')){
                OctoPrint.coreui.viewmodels.settingsViewModel.settings.plugins.themeify.enabled.subscribe(function(enabled) {
                    if (enabled){
                        $('#navbar_plugin_navbarclock').removeClass('ThemeifyOff');
                    }else{
                        $('#navbar_plugin_navbarclock').addClass('ThemeifyOff');
                    }
                });
                if (!OctoPrint.coreui.viewmodels.settingsViewModel.settings.plugins.themeify.enabled()){
                    $('#navbar_plugin_navbarclock').addClass('ThemeifyOff');
                }
            }else{
                $('#navbar_plugin_navbarclock').addClass('ThemeifyOff');
            }
        }

        self.onBeforeBinding = function () {
            self.settings = self.settingsViewModel.settings.plugins.navbarclock;
            setInterval(self.clockUpdate, 1000);
        };
    }

    OCTOPRINT_VIEWMODELS.push({
        construct: NavbarClockViewModel,
        dependencies: ["settingsViewModel"],
        elements: ["#navbar_plugin_navbarclock", "#settings_plugin_navbarclock"]
    });
});
