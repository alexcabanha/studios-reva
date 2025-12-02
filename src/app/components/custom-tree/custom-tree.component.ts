import { Component, Input, Output, EventEmitter, signal, forwardRef, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';

export interface TreeNode {
  id: string;
  label: string;
  data: any;
  children?: TreeNode[];
  expanded?: boolean;
  selected?: boolean;
}

@Component({
  selector: 'app-custom-tree',
  standalone: true,
  imports: [CommonModule, ButtonModule, forwardRef(() => TreeNodeComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="custom-tree">
      <ul class="tree-root">
        <li *ngFor="let node of nodes" class="tree-node">
          <app-tree-node
            [node]="node"
            [level]="0"
            [selectedNodeId]="selectedNodeId()"
            (nodeClick)="onNodeClick($event)"
            (createSubfolder)="createSubfolder.emit($event)"
            (editFolder)="editFolder.emit($event)"
            (deleteFolder)="deleteFolder.emit($event)">
          </app-tree-node>
        </li>
      </ul>
    </div>
  `,
  styles: [`
    .custom-tree {
      width: 100%;
    }

    .tree-root {
      list-style: none;
      margin: 0;
      padding: 0;
      width: 100%;
    }

    .tree-node {
      width: 100%;
    }
  `]
})
export class CustomTreeComponent {
  @Input() nodes: TreeNode[] = [];
  @Output() nodeSelect = new EventEmitter<any>();
  @Output() createSubfolder = new EventEmitter<any>();
  @Output() editFolder = new EventEmitter<any>();
  @Output() deleteFolder = new EventEmitter<any>();

  selectedNodeId = signal<string | null>(null);

  onNodeClick(event: { node: TreeNode, data: any }) {
    this.selectedNodeId.set(event.node.id);
    this.nodeSelect.emit(event);
  }
}

@Component({
  selector: 'app-tree-node',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, forwardRef(() => TreeNodeComponent)],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="tree-node-content"
      [class.selected]="node.id === selectedNodeId"
      (click)="onNodeClick($event)">

      <!-- Toggle button -->
      <button
        *ngIf="hasChildren()"
        class="toggle-btn"
        (click)="toggleExpand($event)"
        type="button">
        <i class="pi" [class.pi-chevron-right]="!node.expanded" [class.pi-chevron-down]="node.expanded"></i>
      </button>
      <span *ngIf="!hasChildren()" class="toggle-spacer"></span>

      <!-- Folder icon -->
      <i class="pi pi-folder folder-icon"></i>

      <!-- Label -->
      <span class="node-label" [title]="node.label">{{ node.label }}</span>

      <!-- Action buttons -->
      <div class="node-actions" [hidden]="node.data === null">
        <button
          type="button"
          class="action-btn create-btn"
          (click)="onCreateSubfolder($event)"
          title="Criar Subpasta">
          <i class="pi pi-folder-plus"></i>
        </button>
        <button
          type="button"
          class="action-btn edit-btn"
          (click)="onEditFolder($event)"
          title="Editar Pasta">
          <i class="pi pi-pencil"></i>
        </button>
        <button
          type="button"
          class="action-btn delete-btn"
          (click)="onDeleteFolder($event)"
          title="Excluir Pasta">
          <i class="pi pi-trash"></i>
        </button>
      </div>
    </div>

    <!-- Children -->
    <ul *ngIf="node.expanded && hasChildren()" class="tree-children">
      <li *ngFor="let child of node.children" class="tree-node">
        <app-tree-node
          [node]="child"
          [level]="level + 1"
          [selectedNodeId]="selectedNodeId"
          (nodeClick)="nodeClick.emit($event)"
          (createSubfolder)="createSubfolder.emit($event)"
          (editFolder)="editFolder.emit($event)"
          (deleteFolder)="deleteFolder.emit($event)">
        </app-tree-node>
      </li>
    </ul>
  `,
  styles: [`
    .tree-node-content {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      padding: 0.5rem 0.5rem;
      border-radius: 0.5rem;
      cursor: pointer;
      transition: background-color 0.15s ease;
      position: relative;
      overflow: hidden;
      height: 2.25rem;
      min-height: 2.25rem;
      max-height: 2.25rem;
      box-sizing: border-box;
    }

    .tree-node-content:hover {
      background-color: #d946ef;
      color: white;
    }

    .tree-node-content.selected {
      background-color: #d946ef !important;
      color: white !important;
      box-shadow: 0 2px 6px rgba(217, 70, 239, 0.12);
    }

    .tree-node-content:hover .folder-icon,
    .tree-node-content:hover .toggle-btn i,
    .tree-node-content.selected .folder-icon,
    .tree-node-content.selected .toggle-btn i {
      color: white !important;
    }

    .toggle-btn {
      all: unset;
      width: 1.25rem;
      height: 1.25rem;
      min-width: 1.25rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      flex-shrink: 0;
    }

    .toggle-btn i {
      font-size: 0.75rem;
      transition: transform 0.2s ease;
    }

    .toggle-spacer {
      width: 1.25rem;
      min-width: 1.25rem;
      flex-shrink: 0;
    }

    .folder-icon {
      width: 1rem;
      min-width: 1rem;
      flex-shrink: 0;
      font-size: 0.875rem;
    }

    .node-label {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: inline-block;
      line-height: 1.25rem;
      height: 1.25rem;
      padding-left: 0.25rem;
      font-size: 0.875rem;
    }

    .node-actions {
      display: flex;
      gap: 0.15rem;
      flex-shrink: 0;
      align-items: center;
      margin-left: auto;
      opacity: 0;
      visibility: hidden;
      transition: opacity 0.15s ease, visibility 0.15s ease;
    }

    .tree-node-content:hover .node-actions,
    .tree-node-content.selected .node-actions {
      opacity: 1 !important;
      visibility: visible !important;
    }

    .action-btn {
      all: unset;
      width: 1.5rem;
      height: 1.5rem;
      min-width: 1.5rem;
      min-height: 1.5rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 0.25rem;
      cursor: pointer;
      transition: background 0.15s ease;
      flex-shrink: 0;
      border: none;
      outline: none;
      background: transparent;
      color: inherit;
      font-size: 0.75rem;
      padding: 0;
      margin: 0;
      box-sizing: border-box;
      user-select: none;
      -webkit-user-select: none;
      pointer-events: auto !important;
    }

    .action-btn:hover {
      background: rgba(255, 255, 255, 0.2);
    }

    .action-btn:active {
      background: rgba(255, 255, 255, 0.35);
      transform: scale(0.95);
    }

    .action-btn i {
      font-size: 0.75rem;
      color: inherit;
      pointer-events: none;
    }

    .delete-btn:hover {
      background: rgba(239, 68, 68, 0.3);
    }

    .delete-btn:active {
      background: rgba(239, 68, 68, 0.5);
    }

    .tree-children {
      list-style: none;
      margin: 0;
      padding: 0;
      padding-left: 1rem;
    }

    .tree-node {
      width: 100%;
    }
  `]
})
export class TreeNodeComponent {
  @Input() node!: TreeNode;
  @Input() level: number = 0;
  @Input() selectedNodeId: string | null = null;
  @Output() nodeClick = new EventEmitter<any>();
  @Output() createSubfolder = new EventEmitter<any>();
  @Output() editFolder = new EventEmitter<any>();
  @Output() deleteFolder = new EventEmitter<any>();

  hasChildren(): boolean {
    return !!this.node.children && this.node.children.length > 0;
  }

  toggleExpand(event: Event): void {
    event.stopPropagation();
    this.node.expanded = !this.node.expanded;
  }

  onNodeClick(event: Event): void {
    this.nodeClick.emit({
      node: this.node,
      data: this.node.data
    });
  }

  onCreateSubfolder(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.createSubfolder.emit(this.node.data);
  }

  onEditFolder(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.editFolder.emit(this.node.data);
  }

  onDeleteFolder(event: Event): void {
    event.preventDefault();
    event.stopPropagation();
    this.deleteFolder.emit(this.node.data);
  }
}
