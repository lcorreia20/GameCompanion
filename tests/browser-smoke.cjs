// Teste opcional com Playwright em um contêiner com Chromium; não requer navegador no host.
const assert = require('node:assert/strict')
const { chromium } = require('playwright')

async function main() {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] })
  try {
    for (const [name, width, height] of [['mobile', 390, 844], ['tablet', 768, 1024], ['desktop', 1440, 900]]) {
      const context = await browser.newContext({ viewport: { width, height } })
      const page = await context.newPage()
      const errors = []
      page.on('pageerror', error => errors.push(error.message))
      page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
      await page.goto(process.env.GAMECOMPANION_URL || 'http://192.168.1.112:5181/', { waitUntil: 'networkidle' })
      await page.getByRole('heading', { name: 'Phantom Blade Zero' }).click()
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'dark')
      assert.equal(await page.locator('.guide-metric .metric-icon').count(), 7)
      assert.equal(await page.getByRole('img', { name: /Arte oficial de Phantom Blade Zero/ }).count(), 1)
      assert.equal(await page.getByRole('heading', { name: /Checklist por região/ }).count(), 1)
      assert.equal(await page.getByRole('group', { name: 'Selecionar região' }).getByRole('button').count(), 10)
      assert.equal(await page.getByRole('combobox', { name: 'Nível de dicas' }).count(), 0)
      assert.equal(await page.getByRole('progressbar').getAttribute('aria-valuemax'), '35')
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)
      assert.ok(overflow <= 1, `${name}: barra horizontal de ${overflow}px`)
      if (name === 'mobile') {
        await page.screenshot({ path: '/tmp/opencode/gamecompanion-mobile-dark.png', fullPage: true })
        await page.getByRole('button', { name: 'Ativar tema claro' }).click()
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
        assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor), 'rgb(243, 246, 251)')
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0)
        await page.screenshot({ path: '/tmp/opencode/gamecompanion-mobile-light.png', fullPage: true })
        await page.locator('.guide-groups details').first().locator('summary').click()
        const row = page.locator('.guide-groups .guide-objective').first()
        assert.equal(await row.locator('.guide-objective-details').count(), 0)
        await row.locator('.guide-reveal').click()
        assert.equal(await row.locator('.guide-objective-details').count(), 1)
        assert.equal(await row.locator('input[type="checkbox"]').isChecked(), false)
        const step = row.locator('input[type="checkbox"]')
        await step.check()
        const saved = await page.evaluate(() => JSON.parse(localStorage.getItem('gamecompanion:progress:v2')).completed.pbz)
        assert.ok(saved.length > 0, 'marcação real deve ser persistida na chave v2')
        await page.reload({ waitUntil: 'networkidle' })
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
        await page.getByRole('heading', { name: 'Phantom Blade Zero' }).click()
        await page.locator('.guide-groups details').first().locator('summary').click()
        assert.equal(await page.locator('.guide-groups input[type="checkbox"]').first().isChecked(), true)
        assert.equal(await page.locator('.guide-groups .guide-objective-details').count(), 0)
        assert.equal(await page.getByText('Definir um objetivo pessoal').count(), 0)
      }
      if (name !== 'mobile') {
        await page.getByRole('button', { name: 'Ativar tema claro' }).click()
        assert.equal(await page.locator('html').getAttribute('data-theme'), 'light')
        assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).backgroundColor), 'rgb(243, 246, 251)')
        assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0)
      }
      await page.screenshot({ path: `/tmp/opencode/gamecompanion-${name}.png`, fullPage: true })
      assert.deepEqual(errors, [], `${name}: erros de console ou de página`)
      console.log(`${name} ${width}x${height}: navegação, viewport e console OK`)
      await context.close()
    }
  } finally {
    await browser.close()
  }
}

main().catch(error => { console.error(error); process.exitCode = 1 })
