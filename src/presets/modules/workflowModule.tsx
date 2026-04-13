import { GitCommit, Workflow } from 'lucide-react';
import type { ModuleDefinition } from '../types';
import { WorkflowCanvas } from '../../components/workflow/WorkflowCanvas';

export const workflowModule: ModuleDefinition = {
  id: 'workflow',
  name: 'Workflow Engine',
  tab: {
    id: 'workflow',
    label: 'Workflow',
    icon: Workflow,
  },
  contextItems: [
    {
      id: 'workflow-canvas',
      label: 'Canvas',
      icon: GitCommit,
    }
  ],
  resolveView: (contextViewId) => {
    switch (contextViewId) {
      case 'workflow-canvas':
      default:
        return <WorkflowCanvas />;
    }
  }
};
