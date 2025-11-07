import { RenderFunction } from '../../RenderFunction';
import { Card } from '../../card/Card';
import { SectionBody } from '../SectionBody';
import { SectionHeader } from '../SectionHeader';
import { SectionModel } from '../SectionModel';

export function makeSectionModelSimple(title: string, render: RenderFunction): SectionModel {
  return {
    key: title,
    onRenderHeader: () => {
      <SectionHeader title={title} />;
    },
    onRenderBody: () => {
      <SectionBody>
        <Card>{render()}</Card>
      </SectionBody>;
    },
  };
}
