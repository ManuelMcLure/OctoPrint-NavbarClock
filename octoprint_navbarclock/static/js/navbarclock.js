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
        self.popoverContent = ko.observable("Wait");
        self.serverOffset = 0;
        self.serverTime = null;

        self.formatTime = function (d, z) {
            var hr;
            var min;
            var dd = new Date(d);   // Copy date
            var sec = d.getUTCSeconds();
            if (z == "server") {
                dd.setTime(d.getTime() + self.serverOffset * 1000);
            }
            if (z == "browser") {
                var hr = dd.getHours();
                var min = dd.getMinutes();
                sec = dd.getSeconds();
            } else {
                var hr = dd.getUTCHours();
                var min = dd.getUTCMinutes();
            }
            if (self.settings.format24h()) {
                if (hr < 10) {
                    hr = "0" + hr;
                }
            } else {
                var ampm = "AM";
                if (hr == 0) {
                    hr = 12;
                } else if (hr == 12) {
                    ampm = "PM";
                } else if (hr > 12) {
                    hr -= 12;
                    ampm = "PM";
                }
            }
            var min = dd.getMinutes();
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
            return ts;
        }

        self.clockUpdate = function () {
            var ts;
            var d = new Date();
            var hr;
            var min;
            var sec = d.getUTCSeconds();
            var ampm = "AM";
            if (self.settings.timeZone() == "server" ||
                self.settings.popover()) {
                if (sec == 0 || self.serverTime == null) {
                    OctoPrint.simpleApiGet("navbarclock").done(function (response) {
                        self.serverTime = response.server_time;
                        self.serverOffset =
                            self.serverTime.tz_offset +
                            self.serverTime.server_timestamp -
                            Math.trunc(Date.now() / 1000);
                    });
                }
            }
            self.timeStr(self.formatTime(d, self.settings.timeZone()));
            if (self.settings.popover()) {
                var content = '<table style="width: 100%;"><thead></thead><tbody>';
                var d = new Date();
                content += "<tr><td>Server:</td><td>" +
                    self.formatTime(d, "server") + "</td></tr>";
                content += "<tr><td>Browser:</td><td>" +
                    self.formatTime(d, "browser") + "</td></tr>";
                content += "<tr><td>UTC:</td><td>" +
                    self.formatTime(d, "utc") + "</td></tr>";
                content += "</tbody></table>";
                self.popoverContent(content);
                $("#navbar_clock_div").popover('enable');
            } else {
                $("#navbar_clock_div").popover('disable');
            }
        };

        self.popoverTrigger = ko.computed(function() {
            console.log("popoverTrigger() called");
            if (self.settings != null &&
                self.settings.popover()) {
                return "hover";
            } else {
                return "manual";
            }
        });

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
