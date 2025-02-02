import * as Helpers from "../helpers";
import { BrowserContext, expect, Page, test } from "@playwright/test";
import { PageModel } from "../PageModel";

test.describe("My profile", () => {
  let context: BrowserContext;
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    context = await browser.newContext();
    page = await context.newPage();
    // navigate to homepage
    await page.goto(Helpers.UI_BASE, { waitUntil: "domcontentloaded" });
    await expect(page).toHaveTitle("Octopus | Built for Researchers");

    // login
    await Helpers.login(page);
    await expect(page.locator(PageModel.header.usernameButton)).toHaveText(
      `${Helpers.ORCID_TEST_NAME}`
    );

    // go to "My Profile" page
    await page.locator(PageModel.header.usernameButton).click();
    await page.locator(PageModel.header.myProfileButton).click();
  });

  test.afterAll(async () => {
    await page.close();
  });

  test("My profile contents", async () => {
    // check user full name
    await expect(page.locator("h1")).toHaveText(`${Helpers.ORCID_TEST_NAME}`);

    // check Employment section
    expect(page.locator(PageModel.profilePage.employment)).toBeVisible();
    const employmentRow = page.locator('tr:has-text("Employer 1")');
    await expect(employmentRow).toBeVisible();

    // check Education section
    expect(page.locator(PageModel.profilePage.education)).toBeVisible();
    const educationRow = page.locator('tr:has-text("Education 1")');
    await expect(educationRow).toBeVisible();

    // check Works section
    expect(page.locator(PageModel.profilePage.works)).toBeVisible();
    const worksRow = page.locator('tr:has-text("10.1037/a0040251")');
    await expect(worksRow).toBeVisible();

    // check Octopus publications section
    await expect(
      page.locator(PageModel.profilePage.octopusPublications)
    ).toBeVisible();
  });

  test("ORCID profile link opens in a new tab", async () => {
    // check ORCID profile link
    const orcidProfileLink = page.locator('a[title="ORCID profile"]');
    await expect(orcidProfileLink).toBeVisible();

    await orcidProfileLink.click();
    await context.waitForEvent("page");

    const pages = context.pages();
    expect(pages.length).toEqual(2);

    const orcidProfilePage = pages[1];
    await expect(orcidProfilePage).toHaveURL(
      (await orcidProfileLink.getAttribute("href")) as string
    );
    await orcidProfilePage.close();
  });
});
