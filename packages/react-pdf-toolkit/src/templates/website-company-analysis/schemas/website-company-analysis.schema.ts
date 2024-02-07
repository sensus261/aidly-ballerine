import { Type } from '@sinclair/typebox';

export const WebsiteCompanyAnalysisSchema = Type.Object({
  companyName: Type.String(),
  riskScore: Type.Number({ default: 0 }),
  website: Type.Object({
    url: Type.String({ format: 'uri' }),
  }),
  companyAnalysis: Type.Object({
    summary: Type.String({ default: '' }),
    indicators: Type.Array(Type.String()),
  }),
  businessConsistency: Type.Union([
    Type.Object({
      summary: Type.String({ default: '' }),
      indicators: Type.Array(Type.String()),
    }),
    Type.Null(),
  ]),
  scamOrFraud: Type.Union([
    Type.Object({
      summary: Type.String({ default: '' }),
      indicators: Type.Array(Type.String()),
    }),
    Type.Null(),
  ]),
});
