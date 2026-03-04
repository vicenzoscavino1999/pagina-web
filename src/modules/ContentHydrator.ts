import { SITE_CONTENT } from '../content/siteContent';
import { renderBasicSections } from './content/basicSectionRenderer';
import { ContentDomWriter } from './content/domWriter';
import { renderFeatureSections } from './content/featureSectionRenderer';
import { renderProcessSections } from './content/processSectionRenderer';
import { renderServiceSections } from './content/serviceSectionRenderer';
import { renderStatsSection } from './content/statsSectionRenderer';
import { renderSupportSections } from './content/supportSectionRenderer';
import { renderTrackingSections } from './content/trackingSectionRenderer';

export class ContentHydrator {
    #content = SITE_CONTENT;
    #dom = new ContentDomWriter();

    init(): void {
        renderBasicSections(this.#content, this.#dom);
        renderTrackingSections(this.#content, this.#dom);
        renderFeatureSections(this.#content, this.#dom);
        renderProcessSections(this.#content, this.#dom);
        renderServiceSections(this.#content, this.#dom);
        renderStatsSection(this.#content, this.#dom);
        renderSupportSections(this.#content, this.#dom);
    }
}
