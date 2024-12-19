import React, { FunctionComponent } from 'react';
import { isNonEmptyArray } from '@ballerine/common';
import { UrlPagination } from '@/common/components/molecules/UrlPagination/UrlPagination';
import { useMerchantMonitoringLogic } from '@/pages/MerchantMonitoring/hooks/useMerchantMonitoringLogic/useMerchantMonitoringLogic';
import { NoBusinessReports } from '@/pages/MerchantMonitoring/components/NoBusinessReports/NoBusinessReports';
import { MerchantMonitoringTable } from '@/pages/MerchantMonitoring/components/MerchantMonitoringTable/MerchantMonitoringTable';
import { buttonVariants } from '@/common/components/atoms/Button/Button';
import { Plus, SlidersHorizontal, Table2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Search } from '@/common/components/molecules/Search';
import {
  Button,
  DropdownMenuTrigger,
  DropdownMenu,
  Skeleton,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
} from '@ballerine/ui';
import { TooltipProvider } from '@/common/components/atoms/Tooltip/Tooltip.Provider';
import { Tooltip } from '@/common/components/atoms/Tooltip/Tooltip';
import { TooltipTrigger } from '@/common/components/atoms/Tooltip/Tooltip.Trigger';
import { TooltipContent } from '@/common/components/atoms/Tooltip/Tooltip.Content';
import { t } from 'i18next';
import { MultiSelect } from '@/common/components/atoms/MultiSelect/MultiSelect';

export const MerchantMonitoring: FunctionComponent = () => {
  const {
    businessReports,
    isLoadingBusinessReports,
    search,
    onSearch,
    totalPages,
    page,
    onPrevPage,
    onNextPage,
    onLastPage,
    onPaginate,
    isLastPage,
    locale,
    createBusinessReport,
    createBusinessReportBatch,
    reportType,
    onReportTypeChange,
    REPORT_TYPE_TO_DISPLAY_TEXT,
    RISK_LEVEL_FILTERS,
    STATUS_LEVEL_FILTERS,
    handleFilterChange,
    handleFilterClear,
    riskLevel,
    status,
  } = useMerchantMonitoringLogic();

  return (
    <div className="flex h-full flex-col space-y-4 px-6 pb-6 pt-10">
      <div className={`flex justify-between`}>
        <h1 className="pb-5 text-2xl font-bold">Merchant Monitoring</h1>
        <div className={`flex space-x-3`}>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className={`flex items-center`} asChild>
                <div>
                  <Link
                    className={buttonVariants({
                      variant: 'outline',
                      className:
                        'flex items-center justify-start gap-2 font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50',
                    })}
                    to={`/${locale}/merchant-monitoring/upload-multiple-merchants`}
                    aria-disabled={!createBusinessReportBatch?.enabled}
                  >
                    <Table2 />
                    <span>Upload Multiple Merchants</span>
                  </Link>
                </div>
              </TooltipTrigger>
              {!createBusinessReportBatch?.enabled && (
                <TooltipContent side={'left'} align={'start'}>
                  {t('business_report_creation.is_disabled')}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider delayDuration={0}>
            <Tooltip>
              <TooltipTrigger className={`flex items-center`} asChild>
                <div>
                  <Link
                    className={buttonVariants({
                      variant: 'outline',
                      className:
                        'flex items-center justify-start gap-2 font-semibold aria-disabled:pointer-events-none aria-disabled:opacity-50',
                    })}
                    to={`/${locale}/merchant-monitoring/create-check`}
                    aria-disabled={!createBusinessReport?.enabled}
                  >
                    <Plus />
                    <span>Create Merchant Check</span>
                  </Link>
                </div>
              </TooltipTrigger>
              {!createBusinessReport?.enabled && (
                <TooltipContent side={'left'} align={'start'}>
                  {t('business_report_creation.is_disabled')}
                </TooltipContent>
              )}
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      <div className={`flex gap-2`}>
        <Search value={search} onChange={onSearch} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline">
              <SlidersHorizontal size={18} className="mr-2" /> Type
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            {Object.entries(REPORT_TYPE_TO_DISPLAY_TEXT).map(([type, displayText]) => (
              <DropdownMenuCheckboxItem
                key={displayText}
                checked={reportType === displayText}
                onCheckedChange={() =>
                  onReportTypeChange(type as keyof typeof REPORT_TYPE_TO_DISPLAY_TEXT)
                }
              >
                {displayText}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {RISK_LEVEL_FILTERS.map(({ title, accessor, options }) => (
          <MultiSelect
            key={title}
            title={title}
            selectedValues={riskLevel ?? []}
            onSelect={handleFilterChange(accessor)}
            onClearSelect={handleFilterClear(accessor)}
            options={options}
          />
        ))}
        {STATUS_LEVEL_FILTERS.map(({ title, accessor, options }) => (
          <MultiSelect
            key={title}
            title={title}
            selectedValues={status ?? []}
            onSelect={handleFilterChange(accessor)}
            onClearSelect={handleFilterClear(accessor)}
            options={options}
          />
        ))}
      </div>
      <div className="flex flex-1 flex-col gap-6 overflow-auto">
        {isNonEmptyArray(businessReports) && <MerchantMonitoringTable data={businessReports} />}
        {Array.isArray(businessReports) && !businessReports.length && !isLoadingBusinessReports && (
          <NoBusinessReports />
        )}
        <div className={`mt-auto flex items-center gap-x-2`}>
          <div className={`flex h-full w-[12ch] items-center text-sm`}>
            {!isLoadingBusinessReports && `Page ${page} of ${totalPages || 1}`}
            {isLoadingBusinessReports && <Skeleton className={`h-5 w-full`} />}
          </div>
          <UrlPagination
            page={page}
            onPrevPage={onPrevPage}
            onNextPage={onNextPage}
            onLastPage={onLastPage}
            onPaginate={onPaginate}
            isLastPage={isLastPage}
          />
        </div>
      </div>
    </div>
  );
};
