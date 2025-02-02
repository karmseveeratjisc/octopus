import { expect, test } from "@playwright/test";
import * as Helpers from "../helpers";
import { PageModel } from "../PageModel";

test.describe("Browse", () => {
  test("Browse contents", async ({ browser }) => {
    // Start up test
    const page = await browser.newPage();
    await page.goto(Helpers.UI_BASE);
    // Navigate to browse page
    await page.locator(PageModel.header.browseButton).click();

    // Check links
    await expect(
      page.locator(PageModel.browse.viewAllPublications)
    ).toHaveAttribute(
      "href",
      "/search?for=publications&type=PROBLEM,HYPOTHESIS,PROTOCOL,DATA,ANALYSIS,INTERPRETATION,REAL_WORLD_APPLICATION,PEER_REVIEW"
    );
    await expect(page.locator(PageModel.browse.viewAllAuthors)).toHaveAttribute(
      "href",
      "/search?for=users"
    );

    // Expect 5 cards
    await expect(
      page.locator(PageModel.browse.card).locator("visible=true")
    ).toHaveCount(5);
  });
});
