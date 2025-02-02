import * as Helpers from "../helpers";
import { expect, test, Page } from "@playwright/test";
import { PageModel } from "../PageModel";

test.describe.configure({ mode: "serial" });

export const createPublication = async (
  page: Page,
  publicationTitle: string,
  pubType: string
) => {
  await page.goto(`${Helpers.UI_BASE}/create`);
  // title
  await page.locator(PageModel.publish.title).click();
  await page.keyboard.type(publicationTitle);
  // choose type
  await page.locator(PageModel.publish.publicationType).selectOption(pubType);
  // confirm
  await page.locator(PageModel.publish.confirmPublicationType).click();
  await page.locator(PageModel.publish.createThisPublicationButton).click();
};

export const publicationFlowKeyInformation = async (
  page: Page,
  licenceType: string,
  rorId: string,
  rorName: string,
  rorCity: string,
  rorLink: string,
  extraDetails: string
) => {
  // Key Information
  // Change licence
  await page
    .locator(PageModel.publish.keyInformation.licence)
    .selectOption(licenceType);
  // Add ROR ID affiliation
  await page.getByText("Enter ROR ID").click();
  await page.getByLabel("Enter ROR ID").press("Tab");

  await page.keyboard.type(rorId, { delay: 100 });

  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/affiliation") &&
        response.ok()
    ),
    page.locator(PageModel.publish.keyInformation.addAffiliationButton).click(),
  ]);

  // Add Manual affiliation
  await page
    .locator(PageModel.publish.keyInformation.manualAffiliationSelect)
    .click();

  await page
    .locator(PageModel.publish.keyInformation.manualAffiliationName)
    .click();
  await page.keyboard.type(rorName);
  await page.keyboard.press("Tab");
  await page.keyboard.type(rorCity);
  await page.keyboard.press("Tab");
  await page.keyboard.press("Tab");
  await page.keyboard.type(rorLink);
  await Promise.all([
    page.waitForResponse(
      (response) =>
        response.request().method() === "POST" &&
        response.url().includes("/affiliation") &&
        response.ok()
    ),
    page.locator(PageModel.publish.keyInformation.addAffiliationButton).click(),
  ]);

  // Further info on affiliations
  await page
    .locator(PageModel.publish.keyInformation.affiliationDetails)
    .click();
  await page.keyboard.type(extraDetails);

  await page.locator(PageModel.publish.nextButton).click();
};

export const publicationFlowLinkedPublication = async (
  page: Page,
  linkedPubSearchTerm: string,
  linkedPubTitle: string
) => {
  // Linked pub
  await page.locator(PageModel.publish.linkedPub.input).click();
  await page.keyboard.type(linkedPubSearchTerm);
  await page.locator(`[role="option"]:has-text("${linkedPubTitle}")`).click();
  await page.locator(PageModel.publish.linkedPub.addLink).click();

  await page.locator(PageModel.publish.nextButton).click();
};

interface Reference {
  text: string;
  refURL: string;
}

const referencesList: Array<Reference> = [
  {
    text: "Pighin S, Savadori L, Barilli E, Cremonesi L",
    refURL: "(doi:10.1177/0272989X11403490)",
  },
  {
    text: "Reyna, V.F. and Brainerd, C.J., 2008. Numeracy",
    refURL: "https://www.testrefurl1234.com",
  },
];

export const publicationFlowMainText = async (
  page: Page,
  mainText: string,
  language: string,
  references: Array<Reference>,
  description: string,
  keywords: string
) => {
  // Text
  await page.locator(PageModel.publish.text.editor).click();
  await page.keyboard.type(mainText);
  await addReferences(page, references);
  await addASingleReference(page, references[1]);
  await deleteFirstReference(page);
  await deleteAllReferences(page);
  // re-add references
  await addReferences(page, references);
  await page.locator(PageModel.publish.text.language).selectOption(language);
  await page.locator(PageModel.publish.text.description).click();
  await page.keyboard.type(description);
  await page.locator(PageModel.publish.text.keywords).click();
  await page.keyboard.type(keywords);
  await page.locator(PageModel.publish.nextButton).click();
};

const addReferences = async (page: Page, references: Array<Reference>) => {
  await page.locator(PageModel.publish.text.references).click();

  for (const reference of references) {
    await page.keyboard.type(`${reference.text} ${reference.refURL}`);
    await page.keyboard.press("Enter");
  }

  await page.locator(PageModel.publish.text.addReferencesButton).click();
};

const deleteAllReferences = async (page: Page) => {
  await page.locator(PageModel.publish.text.deleteAllReferencesButton).click();

  (
    await page.waitForSelector(
      PageModel.publish.text.deleteAllReferencesModalButton
    )
  ).click();

  await page.waitForTimeout(300); // wait for modal to close
};

const addASingleReference = async (page: Page, reference: Reference) => {
  await page.locator(PageModel.publish.text.addReferenceButton).click();

  await page.locator(PageModel.publish.text.continueModalButton).click();

  await page.locator("div[role=dialog] div[contenteditable=true]").click();

  await page.keyboard.type(`${reference.text}`);
  await page.keyboard.press("Tab");
  await page.keyboard.type(`${reference.refURL}`);
  await page.locator(PageModel.publish.text.saveReferenceModalButton).click();
};

const deleteFirstReference = async (page: Page) => {
  await page.locator(PageModel.publish.text.deleteFirstReferenceButton).click();
  await (
    await page.waitForSelector(
      PageModel.publish.text.deleteReferenceModalButton
    )
  ).click();

  await page.waitForTimeout(300); // wait for modal to close
};

export const publicationFlowConflictOfInterest = async (
  page: Page,
  conflictOfInterest: boolean,
  conflictOfInterestText?: string
) => {
  // COI
  if (conflictOfInterest) {
    await page.locator(PageModel.publish.coi.true).click();
    await expect(page.locator(PageModel.publish.coi.TextBox)).toBeVisible();
    await page.locator(PageModel.publish.coi.TextBox).click();
    if (conflictOfInterestText) {
      await page.keyboard.type(conflictOfInterestText);
    }
  } else {
    await page.locator(PageModel.publish.coi.false).click();
  }

  await page.locator(PageModel.publish.nextButton).click();
};

export const publicationFlowFunders = async (
  page: Page,
  rorId: string,
  rorName: string,
  rorCity: string,
  rorLink: string,
  extraDetails: string
) => {
  // Funders
  // Add ROR ID funder
  await page.locator(PageModel.publish.funders.rorID).click();
  await page.keyboard.type(rorId);
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes("/funders") && response.ok()
    ),
    page.locator(PageModel.publish.funders.addAffiliationButton).click(),
  ]);

  // Add Manual funder
  await page.locator(PageModel.publish.funders.manualAffiliationSelect).click();
  await page.locator(PageModel.publish.funders.manualAffiliationName).click();
  await page.keyboard.type(rorName);
  await page.locator(PageModel.publish.funders.manualAffiliationCity).click();
  await page.keyboard.type(rorCity);
  await page.locator(PageModel.publish.funders.manualAffiliationLink).click();
  await page.keyboard.type(rorLink);
  await Promise.all([
    page.waitForResponse(
      (response) => response.url().includes("/funders") && response.ok()
    ),
    page.locator(PageModel.publish.funders.addAffiliationButton).click(),
  ]);

  // Further info on funders
  await page
    .locator(PageModel.publish.keyInformation.affiliationDetails)
    .click();
  await page.keyboard.type(extraDetails);

  await page.locator(PageModel.publish.nextButton).click();
};

export const publicationFlowCoauthors = async (
  page: Page,
  pubType: string,
  licenceType: string
) => {
  // Co authors
};

export const publicationFlowReview = async (
  page: Page,
  pubType: string,
  licenceType: string
) => {
  // Review and publish
};

const problemPublication = {
  pubType: "Research Problem",
  language: "Afar",
  licence: "CC BY-NC 4.0",
  title: "test title",
  author: Helpers.ORCID_TEST_NAME,
  text: "main text",
  references: referencesList,
  coi: "This Research Problem does not have any specified conflicts of interest.",
  funding: "This Research Problem has the following sources of funding:",
  fundingExtraDetails: "extra details",
};

const hypothesisPublication = {
  pubType: "Rationale / Hypothesis",
  language: "Afar",
  licence: "CC BY-NC 4.0",
  title: "test title",
  author: Helpers.ORCID_TEST_NAME,
  text: "main text",
  references: referencesList,
  coi: "This Rationale / Hypothesis does not have any specified conflicts of interest.",
  funding: "This Rationale / Hypothesis has the following sources of funding:",
  fundingExtraDetails: "extra details",
};

const methodPublication = {
  pubType: "Method",
  language: "Afar",
  licence: "CC BY-NC 4.0",
  title: "test title",
  author: Helpers.ORCID_TEST_NAME,
  text: "main text",
  references: referencesList,
  coi: "This Method does not have any specified conflicts of interest.",
  funding: "This Method has the following sources of funding:",
  fundingExtraDetails: "extra details",
};

const analysisPublication = {
  pubType: "Analysis",
  language: "Afar",
  licence: "CC BY-NC 4.0",
  title: "test title",
  author: Helpers.ORCID_TEST_NAME,
  text: "main text",
  references: referencesList,
  coi: "This Analysis does not have any specified conflicts of interest.",
  funding: "This Analysis has the following sources of funding:",
  fundingExtraDetails: "extra details",
};

const interpretationPublication = {
  pubType: "Interpretation",
  language: "Afar",
  licence: "CC BY-NC 4.0",
  title: "test title",
  author: Helpers.ORCID_TEST_NAME,
  text: "main text",
  references: referencesList,
  coi: "This Interpretation does not have any specified conflicts of interest.",
  funding: "This Interpretation has the following sources of funding:",
  fundingExtraDetails: "extra details",
};

const realWorldApplicationPublication = {
  pubType: "Real World Application",
  language: "Afar",
  licence: "CC BY-NC 4.0",
  title: "test title",
  author: Helpers.ORCID_TEST_NAME,
  text: "main text",
  references: referencesList,
  coi: "This Real World Application does not have any specified conflicts of interest.",
  funding: "This Real World Application has the following sources of funding:",
  fundingExtraDetails: "extra details",
};

interface PublicationTestType {
  pubType: string;
  language: string;
  licence: string;
  title: string;
  author: string;
  text: string;
  references: Array<Reference>;
  coi: string;
  funding: string;
  fundingExtraDetails: string;
}

export const checkPublication = async (
  page: Page,
  publication: PublicationTestType
) => {
  const publicationTemplate = (publication: PublicationTestType): string[] => [
    `aside span:has-text("${publication.pubType}")`,
    `aside span:has-text("${publication.language}")`,
    `aside a:has-text("${publication.licence}")`,
    `main > section > header > div >> a:has-text("${Helpers.ORCID_TEST_SHORT_NAME}")`,
    `h1:has-text("${publication.title}")`,
    `text=${publication.references[1].text}`,
    `text=${publication.references[1].refURL}`,
    `text=${publication.coi}`,
    `text=${publication.funding}`,
    `article p:has-text("${publication.fundingExtraDetails}")`,
  ];

  await Promise.all(
    publicationTemplate(publication).map((selector) =>
      expect(page.locator(selector)).toBeVisible()
    )
  );
};

test.describe("Publication flow", () => {
  test("Create a problem (standard publication)", async ({ browser }) => {
    // Start up test
    const page = await browser.newPage();

    // Login
    await page.goto(Helpers.UI_BASE);
    await Helpers.login(page);
    await expect(page.locator(PageModel.header.usernameButton)).toHaveText(
      Helpers.ORCID_TEST_NAME
    );

    await createPublication(page, "test title", "PROBLEM");
    await publicationFlowKeyInformation(
      page,
      "CC_BY_NC",
      "01rv9gx86",
      "ror name",
      "ror city",
      "https://ror.com",
      "extra details"
    );
    await publicationFlowLinkedPublication(
      page,
      "living organisms",
      "How do living organisms function, survive, reproduce and evolve?"
    );
    await publicationFlowMainText(
      page,
      "main text",
      "aa",
      referencesList,
      "description",
      "key, words"
    );
    await publicationFlowConflictOfInterest(page, false);
    await publicationFlowFunders(
      page,
      "01rv9gx86",
      "funder name",
      "funder city",
      "https://funder.com",
      "extra details"
    );

    // Preview and check preview draft publication
    await page.locator(PageModel.publish.nextButton).click();
    await page.locator(PageModel.publish.previewButton).click();
    await checkPublication(page, problemPublication);

    // Publish and check live publication
    await page.locator(PageModel.publish.draftEditButton).click();
    await page.waitForResponse(
      (response) => response.url().includes("/reference") && response.ok()
    );
    await page.locator(PageModel.publish.publishButton).click();
    await page.locator(PageModel.publish.confirmPublishButton).click();
    await checkPublication(page, problemPublication);
  });

  test("Create a hypothesis (standard publication)", async ({ browser }) => {
    // Start up test
    const page = await browser.newPage();

    // Login
    await page.goto(Helpers.UI_BASE);
    await Helpers.login(page);
    await expect(page.locator(PageModel.header.usernameButton)).toHaveText(
      Helpers.ORCID_TEST_NAME
    );

    await createPublication(page, "test title", "HYPOTHESIS");
    await publicationFlowKeyInformation(
      page,
      "CC_BY_NC",
      "01rv9gx86",
      "ror name",
      "ror city",
      "https://ror.com",
      "extra details"
    );
    await publicationFlowLinkedPublication(
      page,
      "living organisms",
      "How do living organisms function, survive, reproduce and evolve?"
    );
    await publicationFlowMainText(
      page,
      "main text",
      "aa",
      referencesList,
      "description",
      "key, words"
    );
    await publicationFlowConflictOfInterest(page, false);
    await publicationFlowFunders(
      page,
      "01rv9gx86",
      "funder name",
      "funder city",
      "https://funder.com",
      "extra details"
    );

    // Preview and check preview draft publication
    await page.locator(PageModel.publish.nextButton).click();
    await page.locator(PageModel.publish.previewButton).click();
    await checkPublication(page, hypothesisPublication);

    // Publish and check live publication
    await page.locator(PageModel.publish.draftEditButton).click();
    await page.waitForResponse(
      (response) => response.url().includes("/reference") && response.ok()
    );
    await page.locator(PageModel.publish.publishButton).click();
    await page.locator(PageModel.publish.confirmPublishButton).click();
    await checkPublication(page, hypothesisPublication);
  });

  test("Create a method (standard publication)", async ({ browser }) => {
    // Start up test
    const page = await browser.newPage();

    // Login
    await page.goto(Helpers.UI_BASE);
    await Helpers.login(page);
    await expect(page.locator(PageModel.header.usernameButton)).toHaveText(
      Helpers.ORCID_TEST_NAME
    );

    await createPublication(page, "test title", "PROTOCOL");
    await publicationFlowKeyInformation(
      page,
      "CC_BY_NC",
      "01rv9gx86",
      "ror name",
      "ror city",
      "https://ror.com",
      "extra details"
    );
    await publicationFlowLinkedPublication(
      page,
      "a",
      "Hypothesis of Improving the quality of life for sustainable"
    );
    await publicationFlowMainText(
      page,
      "main text",
      "aa",
      referencesList,
      "description",
      "key, words"
    );
    await publicationFlowConflictOfInterest(page, false);
    await publicationFlowFunders(
      page,
      "01rv9gx86",
      "funder name",
      "funder city",
      "https://funder.com",
      "extra details"
    );

    // Preview and check preview draft publication
    await page.locator(PageModel.publish.nextButton).click();
    await page.locator(PageModel.publish.previewButton).click();
    await checkPublication(page, methodPublication);

    // Publish and check live publication
    await page.locator(PageModel.publish.draftEditButton).click();
    await page.waitForResponse(
      (response) => response.url().includes("/reference") && response.ok()
    );
    await page.locator(PageModel.publish.publishButton).click();
    await page.locator(PageModel.publish.confirmPublishButton).click();
    await checkPublication(page, methodPublication);
  });

  test("Create an analysis (standard publication)", async ({ browser }) => {
    // Start up test
    const page = await browser.newPage();

    // Login
    await page.goto(Helpers.UI_BASE);
    await Helpers.login(page);
    await expect(page.locator(PageModel.header.usernameButton)).toHaveText(
      Helpers.ORCID_TEST_NAME
    );

    await createPublication(page, "test title", "ANALYSIS");
    await publicationFlowKeyInformation(
      page,
      "CC_BY_NC",
      "01rv9gx86",
      "ror name",
      "ror city",
      "https://ror.com",
      "extra details"
    );
    await publicationFlowLinkedPublication(
      page,
      "a",
      "Data attached to Improving the quality of life for sustainable development"
    );
    await publicationFlowMainText(
      page,
      "main text",
      "aa",
      referencesList,
      "description",
      "key, words"
    );
    await publicationFlowConflictOfInterest(page, false);
    await publicationFlowFunders(
      page,
      "01rv9gx86",
      "funder name",
      "funder city",
      "https://funder.com",
      "extra details"
    );

    // Preview and check preview draft publication
    await page.locator(PageModel.publish.nextButton).click();
    await page.locator(PageModel.publish.previewButton).click();
    await checkPublication(page, analysisPublication);

    // Publish and check live publication
    await page.locator(PageModel.publish.draftEditButton).click();
    await page.waitForResponse(
      (response) => response.url().includes("/reference") && response.ok()
    );
    await page.locator(PageModel.publish.publishButton).click();
    await page.locator(PageModel.publish.confirmPublishButton).click();
    await checkPublication(page, analysisPublication);
  });

  test("Create an interpretation (standard publication)", async ({
    browser,
  }) => {
    // Start up test
    const page = await browser.newPage();

    // Login
    await page.goto(Helpers.UI_BASE);
    await Helpers.login(page);
    await expect(page.locator(PageModel.header.usernameButton)).toHaveText(
      Helpers.ORCID_TEST_NAME
    );

    await createPublication(page, "test title", "INTERPRETATION");
    await publicationFlowKeyInformation(
      page,
      "CC_BY_NC",
      "01rv9gx86",
      "ror name",
      "ror city",
      "https://ror.com",
      "extra details"
    );
    await publicationFlowLinkedPublication(
      page,
      "a",
      "Analysis of Improving the quality of life for sustainable"
    );
    await publicationFlowMainText(
      page,
      "main text",
      "aa",
      referencesList,
      "description",
      "key, words"
    );
    await publicationFlowConflictOfInterest(page, false);
    await publicationFlowFunders(
      page,
      "01rv9gx86",
      "funder name",
      "funder city",
      "https://funder.com",
      "extra details"
    );

    // Preview and check preview draft publication
    await page.locator(PageModel.publish.nextButton).click();
    await page.locator(PageModel.publish.previewButton).click();
    await checkPublication(page, interpretationPublication);

    // Publish and check live publication
    await page.locator(PageModel.publish.draftEditButton).click();
    await page.waitForResponse(
      (response) => response.url().includes("/reference") && response.ok()
    );
    await page.locator(PageModel.publish.publishButton).click();
    await page.locator(PageModel.publish.confirmPublishButton).click();
    await checkPublication(page, interpretationPublication);
  });

  test("Create a real world application (standard publication)", async ({
    browser,
  }) => {
    // Start up test
    const page = await browser.newPage();

    // Login
    await page.goto(Helpers.UI_BASE);
    await Helpers.login(page);
    await expect(page.locator(PageModel.header.usernameButton)).toHaveText(
      Helpers.ORCID_TEST_NAME
    );

    await createPublication(page, "test title", "REAL_WORLD_APPLICATION");
    await publicationFlowKeyInformation(
      page,
      "CC_BY_NC",
      "01rv9gx86",
      "ror name",
      "ror city",
      "https://ror.com",
      "extra details"
    );
    await publicationFlowLinkedPublication(
      page,
      "a",
      "Interpretation of Improving the quality of life for sustainable"
    );
    await publicationFlowMainText(
      page,
      "main text",
      "aa",
      referencesList,
      "description",
      "key, words"
    );
    await publicationFlowConflictOfInterest(page, false);
    await publicationFlowFunders(
      page,
      "01rv9gx86",
      "funder name",
      "funder city",
      "https://funder.com",
      "extra details"
    );

    // Preview and check preview draft publication
    await page.locator(PageModel.publish.nextButton).click();
    await page.locator(PageModel.publish.previewButton).click();
    await checkPublication(page, realWorldApplicationPublication);

    // Publish and check live publication
    await page.locator(PageModel.publish.draftEditButton).click();
    await page.waitForResponse(
      (response) => response.url().includes("/reference") && response.ok()
    );
    await page.locator(PageModel.publish.publishButton).click();
    await page.locator(PageModel.publish.confirmPublishButton).click();
    await checkPublication(page, realWorldApplicationPublication);
  });
});
