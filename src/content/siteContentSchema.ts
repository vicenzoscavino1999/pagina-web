import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);

const isHttpUrl = (value: string): boolean => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const mediaSource = nonEmptyString.refine((value) => value.startsWith('/') || isHttpUrl(value), {
    message: 'Expected an http(s) URL or root-relative asset path',
});

const servicesCardSchema = z.object({
    badge: nonEmptyString,
    badgeClass: nonEmptyString,
    title: nonEmptyString,
    description: nonEmptyString,
    cta: nonEmptyString,
    imageSrc: mediaSource,
    imageAlt: nonEmptyString,
});

const timelineItemSchema = z.object({
    title: nonEmptyString,
    detail: nonEmptyString,
    state: z.enum(['completed', 'current', 'pending']),
});

const truckWaypointSchema = z.object({
    left: z.string().regex(/^\d+%$/),
    iconClass: nonEmptyString,
    title: nonEmptyString,
    subtitle: nonEmptyString,
    isHome: z.boolean(),
});

const featureItemSchema = z.object({
    iconClass: nonEmptyString,
    title: nonEmptyString,
    description: nonEmptyString,
});

const flowStepSchema = z.object({
    iconClass: nonEmptyString,
    iconWrapperClass: nonEmptyString,
    imageSrc: mediaSource,
    imageAlt: nonEmptyString,
    title: nonEmptyString,
    description: nonEmptyString,
});

const statsItemSchema = z.object({
    target: z.number().int().positive(),
    suffix: nonEmptyString,
    label: nonEmptyString,
});

const faqItemSchema = z.object({
    question: nonEmptyString,
    answer: nonEmptyString,
});

const tickerItemSchema = z.object({
    iconClass: nonEmptyString,
    label: nonEmptyString,
});

export const siteContentSchema = z.object({
    media: z.object({
        heroBackgroundSrc: mediaSource,
        heroBackgroundAlt: nonEmptyString,
        appleBackgroundSrc: mediaSource,
        appleBackgroundAlt: nonEmptyString,
        statsBackgroundSrc: mediaSource,
        statsBackgroundAlt: nonEmptyString,
    }),
    brand: z.object({
        legalName: nonEmptyString,
        logoPrimary: nonEmptyString,
        logoSecondary: nonEmptyString,
        footerBrand: nonEmptyString,
    }),
    nav: z.object({
        servicesLabel: nonEmptyString,
        trackingLabel: nonEmptyString,
        coverageLabel: nonEmptyString,
    }),
    contact: z.object({
        phoneDisplay: z.string().regex(/^\d{9}$/),
        contractsLabel: nonEmptyString,
        phoneHref: z.string().regex(/^tel:\+\d+$/),
        whatsappHref: z.url(),
        sectionTitle: nonEmptyString,
        sectionSubtitlePrefix: nonEmptyString,
    }),
    hero: z.object({
        badge: nonEmptyString,
        titleMain: nonEmptyString,
        titleSub: nonEmptyString,
        description: nonEmptyString,
        primaryCta: nonEmptyString,
    }),
    tracking: z.object({
        title: nonEmptyString,
        subtitle: nonEmptyString,
        inputPlaceholder: nonEmptyString,
        submitLabel: nonEmptyString,
        resultGuideLabel: nonEmptyString,
        resultEstimatedLabel: nonEmptyString,
        resetLabel: nonEmptyString,
        timeline: z.array(timelineItemSchema).min(1),
    }),
    apple: z.object({
        headingHtml: nonEmptyString,
        subheading: nonEmptyString,
    }),
    truck: z.object({
        headlineHtml: nonEmptyString,
        subheading: nonEmptyString,
        originLabel: nonEmptyString,
        destinationLabel: nonEmptyString,
        scrollCue: nonEmptyString,
        statuses: z.array(nonEmptyString).min(1),
        waypoints: z.array(truckWaypointSchema).min(1),
    }),
    features: z.object({
        titleHtml: nonEmptyString,
        items: z.array(featureItemSchema).min(1),
        mockup: z.object({
            coverageChip: nonEmptyString,
            pickupTextHtml: nonEmptyString,
            pickupTagOne: nonEmptyString,
            pickupTagTwo: nonEmptyString,
            shieldText: nonEmptyString,
            shieldCoverage: nonEmptyString,
            notificationOne: nonEmptyString,
            notificationTwo: nonEmptyString,
            notificationThree: nonEmptyString,
            methodOne: nonEmptyString,
            methodTwo: nonEmptyString,
            methodThree: nonEmptyString,
            methodFour: nonEmptyString,
            receiptOneLabel: nonEmptyString,
            receiptOneValue: nonEmptyString,
            receiptTwoLabel: nonEmptyString,
            receiptTwoValue: nonEmptyString,
            receiptThreeLabel: nonEmptyString,
            receiptThreeValue: nonEmptyString,
        }),
    }),
    carousel: z.object({
        slideOne: z.object({
            label: nonEmptyString,
            titleHtml: nonEmptyString,
            body: nonEmptyString,
            badgeOne: nonEmptyString,
            badgeTwo: nonEmptyString,
            badgeThree: nonEmptyString,
            phoneTitle: nonEmptyString,
            phoneLabel: nonEmptyString,
            phoneCta: nonEmptyString,
        }),
        slideTwo: z.object({
            label: nonEmptyString,
            titleHtml: nonEmptyString,
            body: nonEmptyString,
            statOneLabel: nonEmptyString,
            statTwoLabel: nonEmptyString,
            phoneTitle: nonEmptyString,
            routeOne: nonEmptyString,
            routeTwo: nonEmptyString,
            routeThree: nonEmptyString,
            etaPrefix: nonEmptyString,
            etaValue: nonEmptyString,
        }),
        slideThree: z.object({
            label: nonEmptyString,
            titleHtml: nonEmptyString,
            body: nonEmptyString,
            timerOne: nonEmptyString,
            timerTwo: nonEmptyString,
            phoneTitle: nonEmptyString,
            deliveredMessage: nonEmptyString,
            deliveredTime: nonEmptyString,
        }),
    }),
    services: z.object({
        eyebrow: nonEmptyString,
        title: nonEmptyString,
        cards: z.array(servicesCardSchema).min(1),
    }),
    serviceCharacteristics: z.object({
        title: nonEmptyString,
        items: z.array(nonEmptyString).min(1),
    }),
    flow: z.object({
        title: nonEmptyString,
        steps: z.array(flowStepSchema).min(1),
    }),
    stats: z.object({
        items: z.array(statsItemSchema).min(1),
    }),
    faq: z.object({
        items: z.array(faqItemSchema).min(1),
    }),
    ticker: z.object({
        items: z.array(tickerItemSchema).min(1),
    }),
    footer: z.object({
        intro: nonEmptyString,
        whatsappLabel: nonEmptyString,
        companyHeading: nonEmptyString,
        coverageHeading: nonEmptyString,
        contractsHeading: nonEmptyString,
        contractsDescription: nonEmptyString,
        signoff: z.array(nonEmptyString).min(1),
        copyright: nonEmptyString,
        companyItems: z.array(nonEmptyString).min(1),
        coverageItems: z.array(nonEmptyString).min(1),
    }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
