const express = require('express');
const { Builder, By } = require('selenium-webdriver');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());

app.post('/run-selenium', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).send('Bilgiler gerekli');
    }

    let driver = await new Builder().forBrowser('chrome').build();
    const maxAttempts = 5;
    let attempt = 0;
    let success = false;
    let fetchedData = ''; // Veri saklamak için değişken

    try {
        await driver.get('https://aigency.dev/sign-in');

        const tryLogin = async () => {
            let findEmail = await driver.findElement(By.id('floatingInput'));
            let findPassword = await driver.findElement(By.id('floatingPassword'));
            let findButton = await driver.findElement(By.id('submit-button'));

            await findEmail.clear();
            await findPassword.clear();

            await findEmail.sendKeys(email);
            await findPassword.sendKeys(password);
            await findButton.click();
        };

        while (attempt < maxAttempts && !success) {
            attempt++;
            console.log(`Deneme ${attempt}`);

            await tryLogin();

            // Giriş sonrası başarılı olup olmadığını kontrol et
            let headerText = await driver.getTitle();

            if (headerText.includes('Sohbetlerim')) {
                success = true;
                break;
            } else {
                await driver.sleep(2000);
            }
        }

        if (success) {
            // Giriş sonrası yönlendirilen sayfadan bir veri çekme işlemi
            let element = await driver.findElement(By.css('.my-credits')); // Elementin selector'ünü girin
            fetchedData = await element.getText(); // Elementin içeriğini al
            res.send(`${fetchedData}`);
        } else {
            res.send(`Hata-1212`);
        }
    } catch (error) {
        res.status(500).send(`Error: ${error}`);
    } finally {
        await driver.quit();
    }
});

app.listen(port, () => {
    console.log(`Selenium server running on http://localhost:${port}`);
});
