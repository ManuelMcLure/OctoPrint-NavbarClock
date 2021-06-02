import octoprint.plugin
import time
import datetime
import dateutil.tz as tz
import flask


class NavbarclockPlugin(
    octoprint.plugin.SettingsPlugin,
    octoprint.plugin.AssetPlugin,
    octoprint.plugin.TemplatePlugin,
    octoprint.plugin.SimpleApiPlugin,
):

    ##~~ SettingsPlugin mixin

    def get_settings_defaults(self):
        return {
            "timeZone": "server",
            "showSeconds": False,
            "format24h": False,
        }

    ##~~ AssetPlugin mixin

    def get_assets(self):
        return {
            "js": ["js/navbarclock.js"],
            "css": ["css/navbarclock.css"],
            "less": ["less/navbarclock.less"],
        }

    ##~~ Softwareupdate hook

    def get_update_information(self):
        return {
            "navbarclock": {
                "displayName": "Navbar Clock",
                "displayVersion": self._plugin_version,
                # version check: github repository
                "type": "github_release",
                "user": "ManuelMcLure",
                "repo": "OctoPrint-NavbarClock",
                "current": self._plugin_version,
                # update method: pip
                "pip": "https://github.com/ManuelMcLure/OctoPrint-NavbarClock/archive/{target_version}.zip",
            }
        }

    ##~~ SimpleApi mixin

    def on_api_get(self, request):
        self._logger.info("NavbarClock - API called")
        return flask.jsonify(
            server_time={
                "tz_offset": datetime.datetime.now(tz.tzlocal())
                .utcoffset()
                .total_seconds(),
                "server_timestamp": int(time.time()),
            }
        )


__plugin_name__ = "Navbar Clock"
__plugin_pythoncompat__ = ">=3.7,<4"  # only python 3


def __plugin_load__():
    global __plugin_implementation__
    __plugin_implementation__ = NavbarclockPlugin()

    global __plugin_hooks__
    __plugin_hooks__ = {
        "octoprint.plugin.softwareupdate.check_config": __plugin_implementation__.get_update_information
    }
