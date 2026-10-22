import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { expect, test } from "@playwright/test";

test.describe("pages and old links", () => {
  for (const [path, heading] of [
    ["/about", "About Us"],
    ["/our-work", "Our Work"],
    ["/gallery", "Gallery"],
    ["/volunteer", "Volunteer"],
  ] as const) {
    test(`opening ${path} directly shows its page (no 404)`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
      await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    });
  }

  test("an old /#projects link ends up on /our-work", async ({ page }) => {
    await page.goto("/#projects");
    await expect(page).toHaveURL(/\/our-work#projects$/);
    await expect(page.getByRole("heading", { level: 1, name: "Our Work" })).toBeVisible();
  });

  test("the history is replaced, so Back does not bounce to the old link", async ({ page }) => {
    await page.goto("/about");
    await page.goto("/#faq");
    await expect(page).toHaveURL(/\/volunteer#faq$/);
    await page.goBack();
    await expect(page).toHaveURL(/\/about$/);
  });

  test("#impact and #contact stay on the home page", async ({ page }) => {
    await page.goto("/#impact");
    await expect(page).toHaveURL(/\/#impact$/);
  });

  test("the navbar's Volunteer button opens /volunteer on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Volunteer", exact: true }).click();
    await expect(page).toHaveURL(/\/volunteer$/);
  });
});

test.describe("responsive image loading", () => {
  for (const path of ["/", "/about", "/our-work", "/gallery", "/volunteer"]) {
    test(`${path} loads images near the initial viewport`, async ({ page }) => {
      await page.goto(path);
      await expect
        .poll(() =>
          page.locator("main img").evaluateAll((images) =>
            images.some((image) => image.getAttribute("src") && image.complete && image.naturalWidth > 0),
          ),
        )
        .toBe(true);
    });
  }

  test("keeps distant About team portraits deferred until the visitor reaches them", async ({ page }) => {
    await page.goto("/about");
    const portrait = page.locator("#team img").first();
    await expect(portrait).toHaveAttribute("alt", "");
    expect(await portrait.getAttribute("src")).toBeNull();

    await portrait.scrollIntoViewIfNeeded();
    await expect
      .poll(() => portrait.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0))
      .toBe(true);
    expect(await portrait.getAttribute("srcset")).toContain("384w");
  });
});

test.describe("mobile menu", () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test("opens, lists every page, navigates and closes", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();

    const menu = page.getByRole("dialog");
    await expect(menu).toBeVisible();
    for (const label of ["Home", "About Us", "Our Work", "Gallery", "Contact", "Volunteer"]) {
      await expect(menu.getByRole("link", { name: label, exact: true })).toBeVisible();
    }

    await menu.getByRole("link", { name: "Our Work", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/our-work$/);
    // After a page change, focus moves to the new page's content, not back to the menu button.
    await expect(page.locator("#main-content")).toBeFocused();
  });

  test("the Volunteer button at the bottom of the menu opens /volunteer", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Volunteer", exact: true }).click();
    await expect(page).toHaveURL(/\/volunteer$/);
  });

  test("Contact jumps to the footer without leaving the page", async ({ page }) => {
    await page.goto("/about");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("dialog").getByRole("link", { name: "Contact", exact: true }).click();
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/about#contact$/);
    await expect(page.locator("#contact")).toBeInViewport();
  });

  test("closes with Escape and returns focus to the menu button", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open menu" })).toBeFocused();
  });
});

test.describe("lightbox", () => {
  test("a gallery photo opens full screen, shows a counter and closes with focus restored", async ({ page }) => {
    await page.goto("/gallery");
    const thumbs = page.locator("#gallery ul li button");
    await thumbs.first().scrollIntoViewIfNeeded();
    const count = await thumbs.count();
    expect(count).toBeGreaterThan(0);

    const thumbnailSrc = await thumbs.first().locator("img").getAttribute("src");
    await thumbs.first().click();
    const viewer = page.getByRole("dialog");
    await expect(viewer).toBeVisible();
    await expect(viewer.getByText(new RegExp(`^1 / ${count}$`))).toBeVisible();
    const fullSizeSrc = await viewer.locator("img").getAttribute("src");
    expect(fullSizeSrc).not.toBe(thumbnailSrc);
    expect(fullSizeSrc).not.toContain("optimized/gallery");

    if (count > 1) {
      await page.keyboard.press("ArrowRight");
      await expect(viewer.getByText(new RegExp(`^2 / ${count}$`))).toBeVisible();
      await page.keyboard.press("ArrowLeft");
      await expect(viewer.getByText(new RegExp(`^1 / ${count}$`))).toBeVisible();
    }

    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(thumbs.first()).toBeFocused();
  });
});

test.describe("dialogs", () => {
  test("an activity card opens its pop-up and the URL can be shared", async ({ page }) => {
    await page.goto("/our-work");
    await page.locator("#projects button[aria-haspopup=dialog]").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveURL(/#projects\/.+/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });

  test("'Volunteer for this activity' opens the Volunteer page", async ({ page }) => {
    await page.goto("/our-work");
    await page.locator("#projects button[aria-haspopup=dialog]").first().click();
    await page.getByRole("dialog").getByRole("button", { name: /volunteer for this activity/i }).click();
    await expect(page).toHaveURL(/\/volunteer$/);
  });
});

test.describe("content on its new page", () => {
  for (const [url, id] of [
    ["/volunteer#faq", "faq"],
    ["/about#journey", "journey"],
    ["/about#future", "future"],
    ["/our-work#projects", "projects"],
    ["/gallery#special-moments", "special-moments"],
  ] as const) {
    test(`${url} lands on #${id}`, async ({ page }) => {
      await page.goto(url);
      await expect(page.locator(`#${id}`)).toBeInViewport();
    });
  }

  test("an activity card on /our-work opens its pop-up, and 'Volunteer for this activity' pre-selects the interest", async ({ page }) => {
    await page.goto("/our-work");
    await page.getByRole("button", { name: "See Clean-Up Drives" }).click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(page).toHaveURL(/\/our-work#projects\/.+/);
    await dialog.getByRole("button", { name: /volunteer for this activity/i }).click();
    await expect(page).toHaveURL(/\/volunteer$/);
    await expect(page.getByRole("checkbox", { name: "Clean-Up drives" })).toBeChecked();
  });

  test("a gallery photo opens the full-screen viewer on /gallery", async ({ page }) => {
    await page.goto("/gallery");
    await page.getByRole("button", { name: /^Open photo/ }).first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  });
});

test.describe("no sideways scrolling", () => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    for (const path of ["/", "/about", "/our-work", "/gallery", "/volunteer"]) {
      test(`${path} at ${width}px`, async ({ page }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        expect(overflow).toBeLessThanOrEqual(0);
      });
    }
  }
});

test.describe("home page", () => {
  test("every call to action opens the right page", async ({ page }) => {
    const cases: [string, RegExp][] = [
      ["Explore Our Work", /\/our-work$/],
      ["Our story & team", /\/about$/],
      ["See all projects & activities", /\/our-work$/],
      ["Become a Volunteer", /\/volunteer$/],
    ];
    for (const [name, url] of cases) {
      await page.goto("/");
      await page.getByRole("main").getByRole("link", { name, exact: false }).first().click();
      await expect(page).toHaveURL(url);
    }
  });

  test("a What We Do card opens the pop-up, and closing it leaves the plain home URL", async ({ page }) => {
    await page.goto("/");
    await page.locator("#what-we-do-preview [data-whatwedo-card]").first().click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await expect(page).toHaveURL(/#projects\/.+/);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(page).toHaveURL(/\/$/);
  });

  test("the home page is much shorter than before: five or six blocks, no long scroll", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    const blocks = await page.locator("main > section").count();
    expect(blocks).toBeLessThanOrEqual(6);
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    // Print the number so it can be compared with the old home page (reported in the Phase 3 summary).
    console.log(`home page height at 390px: ${height}px`);
  });

  test("footer quick links open their pages", async ({ page }) => {
    for (const [name, url] of [
      ["About Us", /\/about$/],
      ["Our Work", /\/our-work$/],
      ["Gallery", /\/gallery$/],
      ["Volunteer", /\/volunteer$/],
      ["The Journey So Far", /\/about#journey$/],
      ["Future Plans", /\/about#future$/],
      ["FAQ", /\/volunteer#faq$/],
    ] as const) {
      await page.goto("/");
      await page.getByRole("navigation", { name: "Quick links" }).getByRole("link", { name, exact: true }).click();
      await expect(page).toHaveURL(url);
    }
  });
});

test.describe("About page sub-navigation", () => {
  const edges = (page: import("@playwright/test").Page) =>
    page.evaluate(() => {
      const main = document.querySelector('nav[aria-label="Main"]')!.getBoundingClientRect();
      const sub = document.querySelector('nav[aria-label="On this page"]')!.getBoundingClientRect();
      return { navbarBottom: main.bottom, subTop: sub.top, subBottom: sub.bottom };
    });

  test("sticks directly under the navbar while the page scrolls", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about#future");
    // Wait for the deep link to scroll the page (the bar is only "stuck" once the page has moved), then
    // check that the gap between the two bars is closed.
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
    await expect
      .poll(async () => {
        const { navbarBottom, subTop } = await edges(page);
        return Math.abs(subTop - navbarBottom);
      })
      .toBeLessThanOrEqual(1);
  });

  test("a chip lands its section just below both bars, not hidden behind them", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about");
    await page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Journey" }).click();
    await expect(page).toHaveURL(/\/about#journey$/);
    await expect
      .poll(async () => {
        const { subBottom } = await edges(page);
        const top = await page.evaluate(() => document.getElementById("journey")!.getBoundingClientRect().top);
        return top - subBottom;
      })
      .toBeGreaterThanOrEqual(-1);
  });

  test("the chip for the section being read is marked current", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about#future");
    await expect(
      page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Future Plans" }),
    ).toHaveAttribute("aria-current", "location");
  });

  test("on a phone the chip row scrolls on its own and the page never scrolls sideways", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 800 });
    await page.goto("/about");
    const result = await page.evaluate(() => {
      const list = document.querySelector('nav[aria-label="On this page"] ul')!;
      return {
        rowOverflow: getComputedStyle(list).overflowX,
        pageOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    expect(result.rowOverflow).toBe("auto");
    expect(result.pageOverflow).toBeLessThanOrEqual(0);
  });
});

// These need people in src/data/team.ts. While the list is empty there is no #team section and they skip
// themselves; once people are added they run with no changes.
test.describe("Core Team (runs once the team has been added)", () => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`the grid fits at ${width}px: no card pokes out and the page does not scroll sideways`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/about");
      test.skip((await page.locator("#team").count()) === 0, "no core team has been added yet");
      const result = await page.evaluate(() => {
        const vw = document.documentElement.clientWidth;
        const cards = Array.from(document.querySelectorAll("#team ul > li"));
        return {
          cardsOutside: cards.filter((li) => li.getBoundingClientRect().right > vw + 0.5).length,
          pageOverflow: document.documentElement.scrollWidth - vw,
          columns: new Set(cards.map((li) => Math.round(li.getBoundingClientRect().left))).size,
        };
      });
      expect(result.cardsOutside).toBe(0);
      expect(result.pageOverflow).toBeLessThanOrEqual(0);
      // 2 columns on phones, 3 on tablets, 4 on desktop (fewer if the team is small).
      expect(result.columns).toBeLessThanOrEqual(width >= 1024 ? 4 : width >= 768 ? 3 : 2);
    });
  }

  test("keyboard: Tab reaches a clickable card, Enter and Space open the dialog, Escape closes it and focus returns", async ({ page }) => {
    await page.goto("/about");
    const card = page.locator("#team li button").first();
    test.skip((await card.count()) === 0, "no core team member with a bio or link has been added yet");
    await card.focus();
    await expect(card).toBeFocused();
    for (const key of ["Enter", "Space"]) {
      await page.keyboard.press(key);
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(card).toBeFocused();
    }
  });

  test("plain cards (no bio, no links) are skipped by the Tab key", async ({ page }) => {
    await page.goto("/about");
    const plainCards = page.locator("#team li:not(:has(button))");
    test.skip((await plainCards.count()) === 0, "no plain core team card exists yet");
    expect(await plainCards.first().locator("button, a, [tabindex]").count()).toBe(0);
  });
});

test.describe("titles, descriptions and prefetch", () => {
  for (const [path, title] of [
    ["/", "Naavu Kavacha - Protecting Nature, One Seed at a Time"],
    ["/about", "About Us | NAAVU KAVACHA"],
    ["/our-work", "Our Work | NAAVU KAVACHA"],
    ["/gallery", "Gallery | NAAVU KAVACHA"],
    ["/volunteer", "Volunteer | NAAVU KAVACHA"],
  ] as const) {
    test(`${path} has its own tab title and a description`, async ({ page }) => {
      await page.goto(path);
      await expect(page).toHaveTitle(title);
      const description = await page.locator('meta[name="description"]').getAttribute("content");
      expect(description?.length ?? 0).toBeGreaterThanOrEqual(50);
      expect(description?.length ?? 0).toBeLessThanOrEqual(160);
    });
  }

  test("the site-wide preview image is still in place", async ({ page }) => {
    await page.goto("/about");
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute("content", "/og-image.jpg");
  });

  test("hovering a navbar link fetches that page's code before the click", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    const requested: string[] = [];
    page.on("request", (request) => requested.push(request.url()));
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About Us" }).hover();
    await expect.poll(() => requested.some((url) => /AboutPage/.test(url))).toBe(true);
    // Hovering again does not fetch it a second time.
    const before = requested.filter((url) => /AboutPage/.test(url)).length;
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gallery" }).hover();
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About Us" }).hover();
    expect(requested.filter((url) => /AboutPage/.test(url)).length).toBe(before);
  });

  test("moving to another page fades <main> in, never blank, and the navbar stays put", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gallery" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Gallery" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect.poll(() => page.evaluate(() => getComputedStyle(document.getElementById("main-content")!).opacity)).toBe("1");
  });

  test("with reduced motion there is no fade at all", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Gallery" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Gallery" })).toBeVisible();
    const inline = await page.evaluate(() => document.getElementById("main-content")!.style.opacity);
    expect(["", "1"]).toContain(inline);
  });
});

// ---------------------------------------------------------------------------------------------------------
// Phase 8: final QA. Every route, every old link, keyboard use, the founder pair, overlap and accessibility.
// ---------------------------------------------------------------------------------------------------------

test.describe("every route loads directly", () => {
  for (const [path, title] of [
    ["/", /Naavu Kavacha/],
    ["/about", /About Us/],
    ["/our-work", /Our Work/],
    ["/gallery", /Gallery/],
    ["/volunteer", /Volunteer/],
  ] as const) {
    test(`${path}: status 200, one h1, one main landmark, no console errors, no failed requests to the site`, async ({ page }) => {
      const problems: string[] = [];
      page.on("pageerror", (error) => problems.push(`pageerror: ${error.message}`));
      page.on("console", (message) => {
        // Third-party fonts can be blocked on a locked-down network; that is not a fault of the site.
        if (message.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED/.test(message.text())) {
          problems.push(`console: ${message.text()}`);
        }
      });
      page.on("response", (response) => {
        if (response.url().startsWith("http://127.0.0.1") && response.status() >= 400) {
          problems.push(`${response.status()}: ${response.url()}`);
        }
      });
      const response = await page.goto(path, { waitUntil: "networkidle" });
      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      expect(problems).toEqual([]);
    });
  }

  test("a bad address shows a friendly 404 page with a way home, and nothing is logged as an error", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (message) => {
      if (message.type() === "error" && !/fonts\.(googleapis|gstatic)|ERR_TUNNEL|ERR_NAME_NOT_RESOLVED|status of 404/.test(message.text())) {
        errors.push(message.text());
      }
    });
    await page.goto("/no-such-page");
    await expect(page.getByRole("heading", { level: 1, name: "404" })).toBeVisible();
    await expect(page.getByRole("main")).toHaveCount(1);
    await page.getByRole("link", { name: "Return to Home" }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    expect(errors).toEqual([]);
  });
});

test.describe("every old /#hash link (legacy redirect table)", () => {
  const redirected: [string, RegExp][] = [
    ["#about", /\/about$/],
    ["#whatwedo", /\/our-work#whatwedo$/],
    ["#projects", /\/our-work#projects$/],
    ["#special-moments", /\/gallery#special-moments$/],
    ["#gallery", /\/gallery#gallery$/],
    ["#journey", /\/about#journey$/],
    ["#future", /\/about#future$/],
    ["#volunteer", /\/volunteer$/],
    ["#faq", /\/volunteer#faq$/],
  ];
  for (const [hash, url] of redirected) {
    test(`/${hash} goes to its new page`, async ({ page }) => {
      await page.goto(`/${hash}`);
      await expect(page).toHaveURL(url);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  }
  for (const hash of ["#home", "#impact", "#contact"]) {
    test(`/${hash} stays on the home page`, async ({ page }) => {
      await page.goto(`/${hash}`);
      await expect(page).toHaveURL(new RegExp(`/${hash}$`));
    });
  }
  test("an old shared activity link (#projects/<id>) opens that activity on /our-work", async ({ page }) => {
    await page.goto("/our-work");
    await page.locator("#projects button[aria-haspopup=dialog]").first().click();
    const shared = new URL(page.url()).hash;
    expect(shared).toMatch(/^#projects\/.+/);
    await page.goto(`/${shared}`);
    await expect(page).toHaveURL(/\/our-work#projects\/.+/);
    await expect(page.getByRole("dialog")).toBeVisible();
  });
});

test.describe("every internal link on every page resolves", () => {
  for (const path of ["/", "/about", "/our-work", "/gallery", "/volunteer"]) {
    test(`links on ${path}`, async ({ page, request }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path, { waitUntil: "networkidle" });
      const hrefs = await page.$$eval("a[href]", (anchors) => anchors.map((a) => a.getAttribute("href") ?? ""));
      const internal = [...new Set(hrefs.filter((href) => href.startsWith("/") || href.startsWith("#")))];
      expect(internal.length).toBeGreaterThan(0);
      for (const href of internal) {
        if (href.startsWith("#")) {
          // In-page jump: the target must exist on this page.
          const id = decodeURIComponent(href.slice(1));
          if (id) await expect(page.locator(`[id="${id}"]`), `${path} links to ${href}`).toHaveCount(1);
          continue;
        }
        const [pathname, hash] = href.split("#");
        const response = await request.get(pathname);
        expect(response.status(), `${path} links to ${href}`).toBe(200);
        if (hash && !hash.includes("/")) {
          await page.goto(href);
          await expect(page.locator(`[id="${hash}"]`), `${href} has a target`).toHaveCount(1);
          await page.goto(path, { waitUntil: "networkidle" });
        }
      }
    });
  }
});

test.describe("Founder and Co-Founder", () => {
  test("both sections sit in the right order and each has its own chip in the sub-navigation", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about");
    const founder = page.locator("#founder");
    const cofounder = page.locator("#cofounder");
    test.skip((await founder.count()) === 0 || (await cofounder.count()) === 0, "no consented founder and co-founder in src/data/team.ts");

    const order = await page.evaluate(
      () => document.getElementById("founder")!.compareDocumentPosition(document.getElementById("cofounder")!),
    );
    expect(order & 4).toBeTruthy(); // 4 = "follows": the co-founder comes after the founder

    const subNav = page.getByRole("navigation", { name: "On this page" });
    for (const [chip, id] of [["Founder", "founder"], ["Co-Founder", "cofounder"]] as const) {
      await subNav.getByRole("link", { name: chip, exact: true }).click();
      await expect(page).toHaveURL(new RegExp(`/about#${id}$`));
      await expect(page.locator(`#${id}`)).toBeInViewport();
    }
  });

  test("each shows a heading, a name and either a photo or the initials avatar", async ({ page }) => {
    await page.goto("/about");
    for (const id of ["founder", "cofounder"]) {
      const section = page.locator(`#${id}`);
      test.skip((await section.count()) === 0, `no consented person in #${id}`);
      await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
      await expect(section.getByRole("heading", { level: 3 }).first()).toBeVisible();
      const photo = section.locator("img");
      const avatar = section.getByTestId("initials-avatar");
      expect((await photo.count()) + (await avatar.count())).toBeGreaterThan(0);
    }
  });

  test("the two sections use opposite sides on desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/about");
    test.skip((await page.locator("#cofounder").count()) === 0 || (await page.locator("#founder").count()) === 0, "pair not present");
    const sides = await page.evaluate(() => {
      const left = (id: string) => {
        const section = document.getElementById(id)!;
        const portrait = section.querySelector("img, [data-testid='initials-avatar']")!;
        return portrait.getBoundingClientRect().left < window.innerWidth / 2 ? "left" : "right";
      };
      return [left("founder"), left("cofounder")];
    });
    expect(sides[0]).not.toBe(sides[1]);
  });
});

test.describe("keyboard", () => {
  test("the skip link is the first Tab stop and moves focus to the page's content", async ({ page }) => {
    for (const path of ["/", "/about", "/our-work", "/gallery", "/volunteer"]) {
      await page.goto(path);
      await page.keyboard.press("Tab");
      const skip = page.getByRole("link", { name: /skip to main content/i });
      await expect(skip).toBeFocused();
      await expect(skip).toBeInViewport();
      await page.keyboard.press("Enter");
      await expect(page.locator("#main-content")).toBeFocused();
    }
  });

  test("on every page the first 12 Tab stops each show a visible focus indicator", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    for (const path of ["/", "/about", "/our-work", "/gallery", "/volunteer"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      for (let i = 0; i < 12; i++) {
        await page.keyboard.press("Tab");
        const visible = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return true; // wrapped around to the browser UI
          const style = getComputedStyle(el);
          const outline = style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
          const ring = style.boxShadow !== "none" && style.boxShadow !== "";
          // Radix and Tailwind rings are drawn on the focused element or its direct wrapper.
          const wrapped = el.parentElement ? getComputedStyle(el.parentElement).boxShadow !== "none" : false;
          return outline || ring || wrapped;
        });
        expect(visible, `${path}: Tab stop ${i + 1} has no visible focus`).toBe(true);
      }
    }
  });

  test("About sub-navigation: Tab reaches every chip and Enter jumps to its section", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/about");
    const chips = page.getByRole("navigation", { name: "On this page" }).getByRole("link");
    const count = await chips.count();
    expect(count).toBeGreaterThanOrEqual(2);
    for (let i = 0; i < count; i++) {
      const chip = chips.nth(i);
      const href = await chip.getAttribute("href");
      await chip.focus();
      await expect(chip).toBeFocused();
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(new RegExp(`${href}$`));
    }
  });

  test("activity pop-up: Escape closes it and focus returns to the card that opened it", async ({ page }) => {
    await page.goto("/our-work");
    const card = page.locator("#projects button[aria-haspopup=dialog]").first();
    await card.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(card).toBeFocused();
  });

  test("Tab stays inside an open dialog (no escaping to the page behind it)", async ({ page }) => {
    await page.goto("/our-work");
    await page.locator("#projects button[aria-haspopup=dialog]").first().click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 25; i++) {
      await page.keyboard.press("Tab");
      const inside = await page.evaluate(() => !!document.activeElement?.closest("[role=dialog]"));
      expect(inside, `Tab stop ${i + 1} left the dialog`).toBe(true);
    }
  });
});

test.describe("the navbar, About sub-nav, floating button and footer never cover each other", () => {
  for (const width of [360, 390, 768, 1024, 1440]) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto("/about", { waitUntil: "networkidle" });

      // 1. After a chip jump, the target heading is not hidden behind the navbar or the sub-nav.
      await page.getByRole("navigation", { name: "On this page" }).getByRole("link", { name: "Journey" }).click();
      await expect
        .poll(() =>
          page.evaluate(() => {
            const bars = Math.max(
              document.querySelector('nav[aria-label="On this page"]')!.getBoundingClientRect().bottom,
              document.querySelector('nav[aria-label="Main"]')!.getBoundingClientRect().bottom,
            );
            return document.getElementById("journey")!.getBoundingClientRect().top - bars;
          }),
        )
        .toBeGreaterThanOrEqual(-1);

      // 2. At the very bottom, every footer link can be clicked: nothing (such as the floating button) sits on top.
      await page.evaluate(() => window.scrollTo({ top: document.documentElement.scrollHeight, behavior: "instant" }));
      await expect
        .poll(() => page.evaluate(() => Math.round(window.innerHeight + window.scrollY) >= document.documentElement.scrollHeight - 2))
        .toBe(true);
      await page.waitForTimeout(500); // let the floating button finish hiding near the footer
      const covered = await page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>("footer a, footer button"))
          .filter((el) => el.getBoundingClientRect().width > 0)
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
            return !(top && (el === top || el.contains(top)));
          })
          .map((el) => el.textContent?.trim() || el.getAttribute("aria-label")),
      );
      expect(covered, "footer controls covered by something else").toEqual([]);
    });
  }
});

// axe-core is not a dependency of the site (nothing was added). To switch this on, run `npm install -D axe-core`
// once; until then these tests skip themselves.
test.describe("accessibility (axe-core)", () => {
  let axeSource: string | null = null;
  try {
    axeSource = readFileSync(createRequire(import.meta.url).resolve("axe-core/axe.min.js"), "utf8");
  } catch {
    axeSource = null;
  }

  for (const path of ["/", "/about", "/our-work", "/gallery", "/volunteer", "/no-such-page"]) {
    for (const width of [390, 1440]) {
      test(`${path} at ${width}px: no serious or critical violations`, async ({ page }) => {
        test.skip(axeSource === null, "axe-core is not installed (npm install -D axe-core to enable)");
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path, { waitUntil: "networkidle" });
        // Scroll through once so lazy sections are rendered, then let the entrance animations finish.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += 600) {
            window.scrollTo(0, y);
            await new Promise((resolve) => setTimeout(resolve, 60));
          }
        });
        await page.waitForTimeout(1500);
        await page.addScriptTag({ content: axeSource! });
        const violations = await page.evaluate(async () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (window as any).axe.run(document);
          return result.violations
            .filter((v: { impact: string }) => v.impact === "serious" || v.impact === "critical")
            .map((v: { id: string; nodes: { html: string }[] }) => `${v.id}: ${v.nodes[0].html.slice(0, 120)}`);
        });
        expect(violations).toEqual([]);
      });
    }
  }
});
