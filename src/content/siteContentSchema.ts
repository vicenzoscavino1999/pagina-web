import { z } from 'zod';

const nonEmptyString = z.string().trim().min(1);
const containsHtmlTag = (value: string): boolean => /<\s*\/?\s*[a-z][^>]*>/i.test(value);
const plainText = nonEmptyString.refine((value) => !containsHtmlTag(value), {
    message: 'Plain text values cannot contain HTML tags',
});
const safeClassName = nonEmptyString.refine((value) => /^[a-zA-Z0-9:_/\-\s]+$/.test(value), {
    message: 'Expected class-like token string',
});

const isLineBreakOnlyHtml = (value: string): boolean => {
    const withoutLineBreakTags = value.replace(/<br\s*\/?>/gi, '');
    return !/[<>]/.test(withoutLineBreakTags);
};

const lineBreakHtml = nonEmptyString.refine(isLineBreakOnlyHtml, {
    message: 'Only <br> tags are allowed in HTML-enabled copy fields',
});

const isHttpUrl = (value: string): boolean => {
    try {
        const parsed = new URL(value);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
    } catch {
        return false;
    }
};

const mediaSource = nonEmptyString
    .refine((value) => value.startsWith('/') || isHttpUrl(value), {
        message: 'Expected an http(s) URL or root-relative asset path',
    })
    .refine((value) => !(/[<>"'`]/.test(value)), {
        message: 'Media source cannot contain HTML-special quote characters',
    });

const servicesCardSchema = z.object({
    badge: plainText,
    badgeClass: safeClassName,
    title: plainText,
    description: plainText,
    cta: plainText,
    imageSrc: mediaSource,
    imageAlt: plainText,
});

const timelineItemSchema = z.object({
    title: plainText,
    detail: plainText,
    state: z.enum(['completed', 'current', 'pending']),
});

const truckWaypointSchema = z.object({
    left: z.string().regex(/^\d+%$/),
    iconClass: safeClassName,
    title: plainText,
    subtitle: plainText,
    isHome: z.boolean(),
});

const featureItemSchema = z.object({
    iconClass: safeClassName,
    title: plainText,
    description: plainText,
});

const flowStepSchema = z.object({
    iconClass: safeClassName,
    iconWrapperClass: safeClassName,
    imageSrc: mediaSource,
    imageAlt: plainText,
    title: plainText,
    description: plainText,
});

const statsItemSchema = z.object({
    target: z.number().int().positive(),
    suffix: plainText,
    label: plainText,
});

const faqItemSchema = z.object({
    question: plainText,
    answer: plainText,
});

const tickerItemSchema = z.object({
    iconClass: safeClassName,
    label: plainText,
});

export const siteContentSchema = z.object({
    media: z.object({
        heroBackgroundSrc: mediaSource,
        heroBackgroundAlt: plainText,
        appleBackgroundSrc: mediaSource,
        appleBackgroundAlt: plainText,
        statsBackgroundSrc: mediaSource,
        statsBackgroundAlt: plainText,
    }),
    brand: z.object({
        legalName: plainText,
        footerBrand: plainText,
    }),
    nav: z.object({
        servicesLabel: plainText,
        trackingLabel: plainText,
        coverageLabel: plainText,
    }),
    contact: z.object({
        phoneDisplay: z.string().regex(/^\d{9}$/),
        contractsLabel: plainText,
        phoneHref: z.string().regex(/^tel:\+\d+$/),
        whatsappHref: z.url(),
        sectionTitle: plainText,
        sectionSubtitlePrefix: plainText,
    }),
    hero: z.object({
        badge: plainText,
        titleMain: plainText,
        titleSub: plainText,
        description: plainText,
        primaryCta: plainText,
    }),
    tracking: z.object({
        title: plainText,
        subtitle: plainText,
        inputPlaceholder: plainText,
        submitLabel: plainText,
        resultGuideLabel: plainText,
        resultEstimatedLabel: plainText,
        resetLabel: plainText,
        timeline: z.array(timelineItemSchema).min(1),
    }),
    apple: z.object({
        headingHtml: lineBreakHtml,
        subheading: plainText,
    }),
    truck: z.object({
        headlineHtml: lineBreakHtml,
        subheading: plainText,
        originLabel: plainText,
        destinationLabel: plainText,
        scrollCue: plainText,
        statuses: z.array(plainText).min(1),
        waypoints: z.array(truckWaypointSchema).min(1),
    }),
    features: z.object({
        titleHtml: lineBreakHtml,
        items: z.array(featureItemSchema).min(1),
        mockup: z.object({
            coverageChip: plainText,
            pickupTextHtml: lineBreakHtml,
            pickupTagOne: plainText,
            pickupTagTwo: plainText,
            shieldText: plainText,
            shieldCoverage: plainText,
            notificationOne: plainText,
            notificationTwo: plainText,
            notificationThree: plainText,
            methodOne: plainText,
            methodTwo: plainText,
            methodThree: plainText,
            methodFour: plainText,
            receiptOneLabel: plainText,
            receiptOneValue: plainText,
            receiptTwoLabel: plainText,
            receiptTwoValue: plainText,
            receiptThreeLabel: plainText,
            receiptThreeValue: plainText,
        }),
    }),
    carousel: z.object({
        slideOne: z.object({
            label: plainText,
            titleHtml: lineBreakHtml,
            body: plainText,
            badgeOne: plainText,
            badgeTwo: plainText,
            badgeThree: plainText,
            phoneTitle: plainText,
            phoneLabel: plainText,
            phoneCta: plainText,
        }),
        slideTwo: z.object({
            label: plainText,
            titleHtml: lineBreakHtml,
            body: plainText,
            statOneLabel: plainText,
            statTwoLabel: plainText,
            phoneTitle: plainText,
            routeOne: plainText,
            routeTwo: plainText,
            routeThree: plainText,
            etaPrefix: plainText,
            etaValue: plainText,
        }),
        slideThree: z.object({
            label: plainText,
            titleHtml: lineBreakHtml,
            body: plainText,
            timerOne: plainText,
            timerTwo: plainText,
            phoneTitle: plainText,
            deliveredMessage: plainText,
            deliveredTime: plainText,
        }),
    }),
    services: z.object({
        eyebrow: plainText,
        title: plainText,
        cards: z.array(servicesCardSchema).min(1),
    }),
    serviceCharacteristics: z.object({
        title: plainText,
        items: z.array(plainText).min(1),
    }),
    flow: z.object({
        title: plainText,
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
        intro: plainText,
        whatsappLabel: plainText,
        companyHeading: plainText,
        coverageHeading: plainText,
        contractsHeading: plainText,
        contractsDescription: plainText,
        signoff: z.array(plainText).min(1),
        copyright: plainText,
        companyItems: z.array(plainText).min(1),
        coverageItems: z.array(plainText).min(1),
    }),
});

export type SiteContent = z.infer<typeof siteContentSchema>;
