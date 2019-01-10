#! /usr/bin/env node

const puppeteer = require('puppeteer')
const fs = require('fs')

let url = process.argv[2]
const device = process.env.DEVICE || "default"
const timeout = process.env.TIMEOUT
const file = process.env.FILE || "boozang-" + new Date().toISOString().split('.')[0]
const token = process.env.TOKEN
const screenshot = !!process.env.SCREENSHOT

const sleep = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms))
}

const isURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?' + // protocol
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|' + // domain name
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
        '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
        '(\\#[.-a-z\\d_/]*)?$', 'i') // fragment locator (. and / are normally invalid)
    return pattern.test(str)
}

if (!url || !isURL(url)) {
    console.error("Invalid URL: " + url)
    process.exit(2)
}

if (timeout) {
    setTimeout(() => {
        console.log(`Timeout! (${Number(timeout)}ms)`)
        process.exit(2)
    }, Number(timeout))
}

(async () => {
    if (url) {
        let success = false

        // Launch the browser
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--disable-infobars', '--no-sandbox', '--disable-setuid-sandbox']
        })

        // Prepare the device
        const page = await browser.newPage()
        const devices = require('puppeteer/DeviceDescriptors')

        await page._client.send('Emulation.clearDeviceMetricsOverride')
        if (device === "default") {
            console.log('Default device.')
        } else if (!devices[device]) {
            console.log('Device ' + device + ' not found, ignoring.')
        } else {
            console.log(`${device} found.Viewport is set to ${devices[device].viewport.width} x ${devices[device].viewport.height}`)
            await page.emulate(devices[device])
        }

        console.log(`Opening URL: ${url}`)

        // Insert token, if option set
        if (token) {
            const position = url.indexOf('#')
            url = [url.slice(0, position), "&token=" + token, url.slice(position)].join('')
        }

        await page.goto(url)

        // Screenshot, if option enabled
        if (screenshot) {
            console.log("Waiting two seconds for screenshot.")
            await sleep(2000)
            await page.screenshot({ path: `/var/boozang/${file}.png` })
            console.log(`Screenshot "${file}.png" saved.`)
        }

        // Messages processing
        page.on('console', async msg => {
            let logString = msg.text()

            if (logString.includes("<html>")) {
            } else {
                console.log(logString)
            }

            // Report step
            if (logString.includes("<html>")) {
                fs.writeFile(`/var/boozang/${file}.html`, logString, (err) => {
                    if (err) {
                        console.error("Error: ", err)
                        process.exit(2)
                    }
                    console.log(`Report "${file}.html" saved.`)
                })

                if (logString.includes("Failed !")) {
                    success = false
                } else if (logString.includes("Success !")) {
                    success = true
                }
                // Tests end
            } else if (logString.includes("All tests completed!")) {
                if (success) {
                    console.log("Tests succeeded!")
                } else {
                    console.error("Tests failed!")
                }
                process.exit(Number(!success))
            }
        })
    }
})().catch((e) => {
    console.error(e);
    process.exit(2)
})