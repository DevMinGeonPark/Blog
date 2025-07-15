
import { App, Editor, MarkdownView, Modal, Notice, Plugin, PluginSettingTab, Setting, TFile } from 'obsidian';
import * as fs from 'fs/promises';
import * as path from 'path';

interface PublisherSettings {
  blogSourcePath: string;
}

const DEFAULT_SETTINGS: PublisherSettings = {
  blogSourcePath: '/Users/min/Desktop/website/astro-blog/src/content/blog',
};

export default class ObsidianPublisher extends Plugin {
  settings: PublisherSettings;

  async onload() {
    await this.loadSettings();

    this.addRibbonIcon('upload-cloud', 'Publish/Unpublish Note', (evt: MouseEvent) => {
      this.togglePublishStatus();
    });

    this.addCommand({
      id: 'toggle-publish',
      name: 'Toggle publish status',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const file = view.file;
        if (file) {
          this.togglePublishStatus(file);
        }
      },
    });

    this.addCommand({
      id: 'publish-current-file',
      name: 'Publish current file',
      editorCallback: (editor: Editor, view: MarkdownView) => {
        const file = view.file;
        if (file) {
          this.setPublishStatus(file, true);
        }
      },
    });

    this.addSettingTab(new PublisherSettingTab(this.app, this));
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }

  async togglePublishStatus(file?: TFile) {
    const targetFile = file || this.app.workspace.getActiveFile();
    if (!targetFile) {
      new Notice('No active file to publish.');
      return;
    }

    await this.app.fileManager.processFrontMatter(targetFile, (frontmatter) => {
      const isPublished = frontmatter.published;
      frontmatter.published = !isPublished;
      new Notice(`File marked as ${!isPublished ? 'published' : 'unpublished'}.`);
      this.copyPublishedFile(targetFile, !isPublished);
    });
  }

  async setPublishStatus(file: TFile, publish: boolean) {
    await this.app.fileManager.processFrontMatter(file, (frontmatter) => {
      if (frontmatter.published !== publish) {
        frontmatter.published = publish;
        new Notice(`File marked as ${publish ? 'published' : 'unpublished'}.`);
        this.copyPublishedFile(file, publish);
      }
    });
  }

  async copyPublishedFile(file: TFile, isPublished: boolean) {
    const vaultPath = (this.app.vault.adapter as any).getBasePath();
    const blogSourcePath = this.settings.blogSourcePath;
    const sourcePath = path.join(vaultPath, file.path);
    const destPath = path.join(blogSourcePath, file.path);

    try {
      if (isPublished) {
        await fs.mkdir(path.dirname(destPath), { recursive: true });
        await fs.copyFile(sourcePath, destPath);
        new Notice(`Copied "${file.basename}" to blog source.`);
      } else {
        await fs.rm(destPath);
        new Notice(`Removed "${file.basename}" from blog source.`);
      }
    } catch (error) {
      console.error('Error processing file:', error);
      new Notice('Error processing file. See console for details.');
    }
  }
}

class PublisherSettingTab extends PluginSettingTab {
  plugin: ObsidianPublisher;

  constructor(app: App, plugin: ObsidianPublisher) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;

    containerEl.empty();

    new Setting(containerEl)
      .setName('Blog source path')
      .setDesc('The path where published markdown files will be copied.')
      .addText(text => text
        .setPlaceholder('Example: blog_src')
        .setValue(this.plugin.settings.blogSourcePath)
        .onChange(async (value) => {
          this.plugin.settings.blogSourcePath = value;
          await this.plugin.saveSettings();
        }));
  }
}
