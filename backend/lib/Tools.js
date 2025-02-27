const fs = require("fs");
const os = require("os");
const path = require("path");

class Tools {
    static MK_DIR_PATH(filepath) {
        var dirname = path.dirname(filepath);
        if (!fs.existsSync(dirname)) {
            Tools.MK_DIR_PATH(dirname);
        }
        if (!fs.existsSync(filepath)) {
            fs.mkdirSync(filepath);
        }
    }

    static ARE_SAME_FILES(filepath1, filepath2) {
        if (filepath1 === filepath2) {
            return true;
        }

        try {
            const stat1 = fs.statSync(filepath1, {bigint: true});
            const stat2 = fs.statSync(filepath2, {bigint: true});
            return (stat1.dev === stat2.dev && stat1.ino === stat2.ino);
        } catch (e) {
            return false;
        }
    }

    static BUFFER_IS_GZIP(buf) {
        return Buffer.isBuffer(buf) && buf[0] === 0x1f && buf[1] === 0x8b;
    }

    static GET_VALETUDO_VERSION() {
        let valetudoVersion = "unknown";

        try {
            const rootDirectory = path.resolve(__dirname, "../..");
            const packageContent = fs.readFileSync(rootDirectory + "/package.json", {"encoding": "utf-8"});

            if (packageContent) {
                valetudoVersion = JSON.parse(packageContent.toString()).version;
            }
        } catch (e) {
            //intentional
        }

        return valetudoVersion;
    }

    static GET_COMMIT_ID() {
        let commitId = "unknown";

        try {
            const rootDirectory = path.resolve(__dirname, "../..");
            commitId = fs.readFileSync(rootDirectory + "/.git/HEAD", {"encoding": "utf-8"}).trim();

            if (commitId.match(/^ref: refs\/heads\/master$/) !== null) {
                commitId = fs.readFileSync(rootDirectory + "/.git/refs/heads/master", {"encoding": "utf-8"}).trim();
            }
        } catch (e) {
            //intentional
        }

        return commitId;
    }

    static GET_FREE_SYSTEM_MEMORY() {
        let considered_free;

        /*
            We can't use MemAvailable here, since that's only available on kernel 3.14 and newer
            however roborock still uses kernel 3.4 on some of their devices

            See: https://manpages.debian.org/buster/manpages/proc.5.en.html
         */
        try {
            const meminfo = fs.readFileSync("/proc/meminfo").toString();

            const buffers = /^Buffers:\s*(?<buffers>\d+) kB/m.exec(meminfo)?.groups?.buffers;
            const cached = /^Cached:\s*(?<cached>\d+) kB/m.exec(meminfo)?.groups?.cached;

            considered_free = (parseInt(buffers) + parseInt(cached)) * 1024;
        } catch (e) {
            //intentional
        }

        // This intentionally uses isNaN and not Number.isNaN
        if (isNaN(considered_free)) {
            considered_free = 0;
        }

        return os.freemem() + considered_free;
    }
}

module.exports = Tools;
