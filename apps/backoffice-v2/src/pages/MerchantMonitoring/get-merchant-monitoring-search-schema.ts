import { BaseSearchSchema } from '@/common/hooks/useSearchParamsByEntity/validation-schemas';
import { z } from 'zod';
import { TBusinessReport } from '@/domains/business-reports/fetchers';
import { BooleanishRecordSchema } from '@ballerine/ui';
import {
  REPORT_TYPE_TO_DISPLAY_TEXT,
  RISK_LEVELS,
  STATUS_OPTIONS,
} from './hooks/useMerchantMonitoringLogic/useMerchantMonitoringLogic';

export const getMerchantMonitoringSearchSchema = () =>
  BaseSearchSchema.extend({
    sortBy: z
      .enum([
        'createdAt',
        'updatedAt',
        'business.website',
        'business.companyName',
        'business.country',
        'riskScore',
        'status',
        'reportType',
      ] as const satisfies ReadonlyArray<
        | Extract<
            keyof NonNullable<TBusinessReport>,
            'createdAt' | 'updatedAt' | 'riskScore' | 'status' | 'reportType'
          >
        | 'business.website'
        | 'business.companyName'
        | 'business.country'
      >)
      .catch('createdAt'),
    reportType: z
      .enum([
        ...(Object.values(REPORT_TYPE_TO_DISPLAY_TEXT) as [
          (typeof REPORT_TYPE_TO_DISPLAY_TEXT)['All'],
          ...Array<(typeof REPORT_TYPE_TO_DISPLAY_TEXT)[keyof typeof REPORT_TYPE_TO_DISPLAY_TEXT]>,
        ]),
      ])
      .catch('All'),
    selected: BooleanishRecordSchema.optional(),
    riskLevel: z
      .array(
        z.enum(
          RISK_LEVELS.map(riskLevel => riskLevel.toLowerCase()) as [
            (typeof RISK_LEVELS)[number],
            ...Array<(typeof RISK_LEVELS)[number]>,
          ],
        ),
      )
      .catch([]),
    status: z
      .array(
        z.enum(
          STATUS_OPTIONS.map(status => status.toLowerCase()) as [
            (typeof STATUS_OPTIONS)[number],
            ...Array<(typeof STATUS_OPTIONS)[number]>,
          ],
        ),
      )
      .catch([]),
  });
