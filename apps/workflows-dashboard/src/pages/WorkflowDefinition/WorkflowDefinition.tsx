import { useWorkflowDefinitionQuery } from '@/common/hooks/useWorkflowDefinitionQuery';
import { Card, CardContent, CardHeader } from '@/components/atoms/Card';
import { LoadingSpinner } from '@/components/atoms/LoadingSpinner';
import { DashboardLayout } from '@/components/layouts/DashboardLayout';
import { XstateVisualizer } from '@/components/organisms/XstateVisualizer';
import { IWorkflow } from '@/domains/workflows/api/workflow';
import { EditorCard } from '@/pages/WorkflowDefinition/components/EditorCard';
import { WorkflowDefinitionEditor } from '@/pages/WorkflowDefinition/components/WorkflowDefinitionEditor/WorkflowDefinitionEditor';
import { WorkflowDefinitionSummaryCard } from '@/pages/WorkflowDefinition/components/WorkflowDefinitionSummaryCard';
import { useUpgradeWorkflowDefinitionVersionMutation } from '@/pages/WorkflowDefinition/hooks/useUpgradeWorkflowDefinitionVersionMutation';
import { useWorkflowDefinitionEdit } from '@/pages/WorkflowDefinition/hooks/useWorkflowDefinitionEdit';
import { useWorkflowDefinitionExtensionsEdit } from '@/pages/WorkflowDefinition/hooks/useWorkflowDefinitionExtensionsEdit';
import { ViewWorkflow } from '@/pages/Workflows/components/organisms/WorkflowsList/components/ViewWorkflow';
import { isAxiosError } from 'axios';
import { Link, useParams } from 'react-router-dom';
import { Dialog } from '@/components/atoms/Dialog';
import { useState } from 'react';
import { Button } from '@/components/atoms/Button';

export const VENDOR_DETAILS = {
  'dow-jones': {
    logoUrl: 'https://cdn.ballerine.io/logos/Dow_Jones_Logo.png',
    description: 'Dow Jones provides sanctions screening and risk data for individuals',
  },
  'comply-advantage': {
    logoUrl: 'https://cdn.ballerine.io/logos/comply-advantage-logo.png',
    description:
      'ComplyAdvantage offers AI-driven sanctions screening and monitoring for individuals',
  },
  'asia-verify': {
    logoUrl: 'https://cdn.ballerine.io/logos/AsiaVerify_Logo.png',
    description:
      'AsiaVerify provides company screening, UBO verification and registry information services focused on APAC region',
  },
  veriff: {
    logoUrl: 'https://cdn.ballerine.io/logos/Veriff_logo.svg.png',
    description: 'Veriff provides KYC verification and identity proofing services',
  },
  ballerine: {
    logoUrl: 'https://cdn.ballerine.io/logos/ballerine-logo.png',
    description: 'Ballerine provides merchant monitoring services',
  },
  kyckr: {
    logoUrl: 'https://cdn.ballerine.io/logos/kyckr-logo.png',
    description: 'Kyckr provides UBO verification and company registry information services',
  },
  test: {
    logoUrl: 'https://cdn.ballerine.io/logos/ballerine-logo.png',
    description: 'Test vendor for development purposes',
  },
} as const;

export type VendorId = keyof typeof VENDOR_DETAILS;

export const WorkflowDefinition = () => {
  const id = useParams<{ id: string }>().id;
  const { data, isLoading, error } = useWorkflowDefinitionQuery(id);
  const { workflowDefinitionValue, handleWorkflowDefinitionSave } = useWorkflowDefinitionEdit(data);
  const { workflowDefinitionExtensions, handleWorkflowExtensionsSave } =
    useWorkflowDefinitionExtensionsEdit(data);
  const { mutate: upgradeWorkflowDefinitionVersion } =
    useUpgradeWorkflowDefinitionVersionMutation();
  const [isIntegrationCatalogOpen, setIsIntegrationCatalogOpen] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (isLoading) {
    return (
      <DashboardLayout pageName="Loading">
        <div className="flex h-full w-full justify-center">
          <LoadingSpinner />
        </div>
      </DashboardLayout>
    );
  }

  if (isAxiosError(error)) {
    if (error.response?.status === 404) {
      return (
        <DashboardLayout pageName="Workflow Definition">
          <h1 className="flex flex-col gap-4">Workflow Definition not found.</h1>
          <h2>
            Back to{' '}
            <Link to="/workflow-definitions">
              <span className="underline">list.</span>
            </Link>
          </h2>
        </DashboardLayout>
      );
    }

    return (
      <DashboardLayout pageName="Workflow Definition">
        Failed to fetch workflow definition.
      </DashboardLayout>
    );
  }

  if (!data) return null;

  return (
    <>
      <DashboardLayout pageName={`Workflow Definition - ${data?.displayName || data?.name}`}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-row items-stretch gap-2">
            <div className="w-[75%]">
              <Card className="h-full bg-gradient-to-br from-slate-50 to-white shadow-lg">
                <CardHeader className="flex flex-row justify-between border-b border-slate-200 bg-white/50">
                  <h2 className="text-lg font-bold text-slate-800">X-State Visualizer</h2>
                  <ViewWorkflow
                    workflow={{ state: '', workflowDefinitionId: data?.id } as IWorkflow}
                  />
                </CardHeader>
                <CardContent className="mr-6 flex h-[400px] flex-row overflow-hidden">
                  <XstateVisualizer
                    stateDefinition={data?.definition}
                    state={''}
                    key={JSON.stringify(data?.definition || {})}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="w-[25%]">
              <WorkflowDefinitionSummaryCard workflowDefinition={data} />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-1/2">
              <WorkflowDefinitionEditor workflowDefinition={data} />
            </div>
            <div className="w-1/2">
              <EditorCard
                title="Config"
                value={data.config}
                onChange={value => {
                  console.log('changed value', value);
                }}
                onUpgrade={() =>
                  upgradeWorkflowDefinitionVersion({ workflowDefinitionId: data.id! })
                }
              />
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="w-1/2">
              <EditorCard
                title="Plugins"
                value={workflowDefinitionExtensions || {}}
                onSave={handleWorkflowExtensionsSave}
                onUpgrade={() =>
                  upgradeWorkflowDefinitionVersion({ workflowDefinitionId: data.id! })
                }
                enableViewMode={true}
                viewDialogContent={
                  <div className="flex flex-col gap-8 bg-slate-50 p-6">
                    <div className="flex justify-end">
                      <Button onClick={() => setIsIntegrationCatalogOpen(true)}>
                        View Integration Catalog
                      </Button>
                    </div>
                    {isIntegrationCatalogOpen && (
                      <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <Dialog
                          open={isIntegrationCatalogOpen}
                          onOpenChange={setIsIntegrationCatalogOpen}
                        >
                          <div className="max-h-[90vh] w-[90vw] overflow-y-auto rounded-xl bg-white p-8 shadow-2xl">
                            <div className="flex flex-col gap-4">
                              <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">Integration Catalog</h2>
                                <Button
                                  variant="ghost"
                                  onClick={() => setIsIntegrationCatalogOpen(false)}
                                  className="rounded-full p-2 hover:bg-slate-100"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </Button>
                              </div>
                              <div className="grid grid-cols-2 gap-6 p-6">
                                {Object.entries(VENDOR_DETAILS).map(([vendorKey, vendorInfo]) => (
                                  <div
                                    key={vendorKey}
                                    className="flex flex-col gap-4 rounded-xl border border-slate-200 p-6 shadow-sm"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="h-16 w-16 overflow-hidden rounded-lg border border-slate-100 bg-white p-2">
                                        <img
                                          src={vendorInfo.logoUrl}
                                          alt={vendorKey}
                                          className="h-full w-full object-contain"
                                          onError={e => {
                                            e.currentTarget.src =
                                              'https://cdn.ballerine.io/logos/ballerine-logo.png';
                                          }}
                                        />
                                      </div>
                                      <div className="flex flex-col gap-2">
                                        <div className="flex items-center gap-2">
                                          <h4 className="font-semibold text-slate-800">
                                            {vendorKey
                                              .split('-')
                                              .map(
                                                word =>
                                                  word.charAt(0).toUpperCase() + word.slice(1),
                                              )
                                              .join(' ')}
                                          </h4>
                                          <button
                                            onClick={() => copyToClipboard(vendorKey)}
                                            className="rounded-md p-1 hover:bg-slate-100"
                                            title="Copy vendor key"
                                          >
                                            <svg
                                              xmlns="http://www.w3.org/2000/svg"
                                              className="h-4 w-4"
                                              viewBox="0 0 24 24"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="2"
                                              strokeLinecap="round"
                                              strokeLinejoin="round"
                                            >
                                              <rect
                                                x="9"
                                                y="9"
                                                width="13"
                                                height="13"
                                                rx="2"
                                                ry="2"
                                              ></rect>
                                              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                            </svg>
                                          </button>
                                        </div>
                                        <p className="text-sm text-slate-600">
                                          {vendorInfo.description}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </Dialog>
                      </div>
                    )}
                    {Object.entries(workflowDefinitionExtensions || {}).map(
                      ([category, plugins]) => (
                        <div
                          key={category}
                          className="rounded-xl border border-slate-200 bg-white p-8 shadow-md transition-shadow hover:shadow-lg"
                        >
                          <h3 className="mb-8 flex items-center gap-3 text-2xl font-bold text-slate-800">
                            <div className="h-10 w-1 rounded-full bg-blue-500" />
                            {category
                              .split(/(?=[A-Z])/)
                              .join(' ')
                              .replace('Plugins', '')
                              .replace(/^\w/, c => c.toUpperCase())}{' '}
                            Plugins
                          </h3>
                          <div className="grid grid-cols-3 gap-6">
                            {(plugins as any[]).map(plugin => (
                              <div
                                key={plugin.name}
                                className="group flex flex-col gap-4 rounded-xl border border-slate-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="relative h-20 w-20 overflow-hidden rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition-all group-hover:border-blue-100 group-hover:shadow-md">
                                    {plugin.vendor === 'test' ? (
                                      <div className="flex h-full w-full items-center justify-center">
                                        <span className="text-lg font-medium text-slate-400">
                                          Test
                                        </span>
                                      </div>
                                    ) : plugin.vendor ? (
                                      <img
                                        src={
                                          VENDOR_DETAILS[plugin.vendor as VendorId]?.logoUrl ||
                                          `https://cdn.ballerine.io/logos/${plugin.vendor.toLowerCase()}-logo.png`
                                        }
                                        alt={plugin.vendor}
                                        className="h-full w-full object-contain"
                                        onError={e => {
                                          e.currentTarget.src =
                                            'https://cdn.ballerine.io/logos/ballerine-logo.png';
                                        }}
                                      />
                                    ) : (
                                      <img
                                        src="https://cdn.ballerine.io/logos/ballerine-logo.png"
                                        alt="Ballerine"
                                        className="mx-auto h-12 w-12 rounded-full object-contain"
                                      />
                                    )}
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-slate-800 transition-colors group-hover:text-blue-600">
                                      {(plugin.displayName || plugin.name)
                                        .split(/(?=[A-Z])/)
                                        .join(' ')}
                                    </h4>
                                    <div className="flex flex-col gap-1">
                                      <p className="text-sm font-medium text-slate-400">
                                        {plugin.pluginKind}
                                      </p>
                                      {plugin.vendor && (
                                        <p className="text-sm font-medium text-slate-500">
                                          by {plugin.vendor}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {plugin.stateNames?.length > 0 && (
                                  <div className="flex flex-wrap gap-2">
                                    {plugin.stateNames?.map((state: string) => (
                                      <span
                                        key={state}
                                        className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 shadow-sm"
                                      >
                                        {state}
                                      </span>
                                    ))}
                                  </div>
                                )}

                                <div className="mt-auto flex flex-col gap-2 border-t border-slate-100 pt-4">
                                  {plugin.successAction && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium text-slate-600">Success:</span>
                                      <span className="rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                                        {plugin.successAction}
                                      </span>
                                    </div>
                                  )}

                                  {plugin.errorAction && (
                                    <div className="flex items-center gap-2 text-sm">
                                      <span className="font-medium text-slate-600">Error:</span>
                                      <span className="rounded-md bg-red-50 px-2 py-0.5 font-medium text-red-600">
                                        {plugin.errorAction}
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                }
              />
            </div>
            <div className="w-1/2">
              <EditorCard
                title="Context Schema"
                value={data.contextSchema}
                onChange={value => {
                  console.log('changed value', value);
                }}
                onUpgrade={() =>
                  upgradeWorkflowDefinitionVersion({ workflowDefinitionId: data.id! })
                }
              />
            </div>
          </div>
        </div>
      </DashboardLayout>
    </>
  );
};
