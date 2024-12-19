import { useBusinessReportsQuery } from '@/domains/business-reports/hooks/queries/useBusinessReportsQuery/useBusinessReportsQuery';
import { useZodSearchParams } from '@/common/hooks/useZodSearchParams/useZodSearchParams';
import { getMerchantMonitoringSearchSchema } from '@/pages/MerchantMonitoring/get-merchant-monitoring-search-schema';
import { usePagination } from '@/common/hooks/usePagination/usePagination';
import { useLocale } from '@/common/hooks/useLocale/useLocale';
import { useCustomerQuery } from '@/domains/customer/hooks/queries/useCustomerQuery/useCustomerQuery';
import { useSearch } from '@/common/hooks/useSearch/useSearch';
import { useCallback } from 'react';

export const REPORT_TYPE_TO_DISPLAY_TEXT = {
  All: 'All',
  MERCHANT_REPORT_T1: 'Onboarding',
  ONGOING_MERCHANT_REPORT_T1: 'Monitoring',
} as const;

const DISPLAY_TEXT_TO_MERCHANT_REPORT_TYPE = {
  All: 'All',
  MERCHANT_REPORT_T1: 'MERCHANT_REPORT_T1',
  ONGOING_MERCHANT_REPORT_T1: 'ONGOING_MERCHANT_REPORT_T1',
} as const;

export const RISK_LEVELS = ['Critical', 'High', 'Medium', 'Low'] as const;

const RISK_LEVEL_FILTERS = [
  {
    title: 'Risk Level',
    options: RISK_LEVELS.map(riskLevel => ({
      label: riskLevel,
      value: riskLevel.toLowerCase(),
    })),
  },
];

export const useMerchantMonitoringLogic = () => {
  const locale = useLocale();
  const { data: customer } = useCustomerQuery();

  const MerchantMonitoringSearchSchema = getMerchantMonitoringSearchSchema();

  const [
    { page, pageSize, sortBy, sortDir, search: searchParamValue, reportType, riskLevel },
    setSearchParams,
  ] = useZodSearchParams(MerchantMonitoringSearchSchema);

  const { search: searchTerm, onSearch } = useSearch({
    initialSearch: searchParamValue,
  });

  const search = searchTerm as string;

  const { data, isLoading: isLoadingBusinessReports } = useBusinessReportsQuery({
    reportType:
      DISPLAY_TEXT_TO_MERCHANT_REPORT_TYPE[
        reportType as keyof typeof DISPLAY_TEXT_TO_MERCHANT_REPORT_TYPE
      ],
    search,
    page,
    pageSize,
    sortBy,
    sortDir,
    riskLevel: riskLevel ?? [],
  });

  const onReportTypeChange = (reportType: keyof typeof REPORT_TYPE_TO_DISPLAY_TEXT) => {
    setSearchParams({ reportType: REPORT_TYPE_TO_DISPLAY_TEXT[reportType] });
  };

  const onRiskLevelChange = useCallback(
    (selected: unknown[]) => {
      const selectedRiskLevels = selected as Array<(typeof RISK_LEVELS)[number]>;

      setSearchParams({
        riskLevel: selectedRiskLevels,
      });
    },
    [setSearchParams],
  );

  const onClearSelect = useCallback(() => {
    setSearchParams({ riskLevel: [] });
  }, [setSearchParams]);

  const { onPaginate, onPrevPage, onNextPage, onLastPage, isLastPage } = usePagination({
    totalPages: data?.totalPages ?? 0,
  });

  return {
    totalPages: data?.totalPages || 0,
    totalItems: data?.totalItems || 0,
    createBusinessReport: customer?.features?.createBusinessReport,
    createBusinessReportBatch: customer?.features?.createBusinessReportBatch,
    businessReports: data?.data || [],
    isLoadingBusinessReports,
    search,
    onSearch,
    page,
    onPrevPage,
    onNextPage,
    onLastPage,
    onPaginate,
    isLastPage,
    locale,
    reportType,
    onReportTypeChange,
    REPORT_TYPE_TO_DISPLAY_TEXT,
    RISK_LEVEL_FILTERS,
    onRiskLevelChange,
    onClearSelect,
  };
};
