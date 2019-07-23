import { Vue, Component, Prop } from 'vue-property-decorator';
import { FirestoreDocument, Storage } from '@/vue-common';
import ProjectFile from '@/models/projectFile';
import Bricks from 'bricks.js';
import Opener from '../opener';
import Collections from '@/models/collections';
import _ from 'lodash';

@Component({})
export default class FileCard extends Vue {
  public $refs!: {
    opener: Opener;
  };
  @Prop()
  public file!: FirestoreDocument<ProjectFile>;
  @Prop()
  public isOwner!: boolean;
  private enableDelete: boolean = false;
  private menu: boolean = false;
  private tags: Array<string> = [];
  private attachedTags: Array<string> = [];
  private defaultTags = ['design', 'resource', 'code', 'layout'];
  private inputVisible: boolean = false;
  private inputValue: string = '';
  private visibleList = false;

  private async deleteTag(tag: string) {
    const index = this.attachedTags.findIndex(t => {
      return t === tag;
    });
    this.tags.splice(index, 1);

    this.file.data.tags.splice(index, 1);
    await this.file.saveSync();
  }

  private async createTag() {
    if (this.inputValue.length <= 0) {
      return;
    }

    let isEqual = false;
    for (const tag of this.attachedTags) {
      if (tag === this.inputValue) {
        isEqual = true;
      }
    }

    if (isEqual) {
      return;
    }

    this.tags.push(this.inputValue);
    this.attachedTags.push(this.inputValue);

    this.file.data.tags.push(this.inputValue);
    await this.file.saveSync();

    this.inputValue = '';
  }

  private get exampleTags() {
    return _.filter(this.tags, t => {
      if (this.attachedTags.length === 0) return this.tags;
      for (const tag of this.attachedTags) {
        return t !== tag;
      }
    });
  }

  private async onDelete() {
    this.$progress.show();
    await this.file.delete();
    if (this.fileIcon.tag === 'image' || this.fileIcon.tag === 'video') {
      const storage = new Storage(`/files/${this.file.id}`);
      await storage.delete();
    }

    this.$progress.off();
  }

  private isAuthorized() {
    if (this.file.data.uid === this.$store.getters.user.id || this.isOwner) {
      this.enableDelete = true;
      return;
    } else {
      this.enableDelete = false;
      return;
    }
  }

  private async showPreview() {
    this.file.data.accessDate = new Date().toUTCString();
    await this.file.saveSync();

    this.$dialogPreview.on(
      this.file.data.name,
      this.file.data.fileType,
      this.file.data.fileURL
    );
  }

  private showComment() {
    this.$store.commit('setSelectedFile', this.file);
    this.$emit('open-comment');
  }

  private get fileIcon() {
    // TODO 확장자 추가 or로 달고 image는 필요없음.
    const fileExtension = this.file.data.name.split('.');
    if (this.file.data.fileType.startsWith('image')) {
      return {
        tag: 'image',
        kind: 'image',
        icon: 'image',
        color: 'rgb(240,180,0)'
      };
    } else if (this.file.data.fileType.startsWith('application/pdf')) {
      return {
        tag: 'pdf',
        kind: 'file',
        icon: 'file-pdf',
        color: 'rgb(233,67,52)'
      };
    } else if (this.file.data.fileType.startsWith('video')) {
      return {
        tag: 'video',
        kind: 'video',
        icon: 'video-camera',
        playable: this.file.data.name.endsWith('.mp4'),
        color: 'rgb(217, 48, 37)'
      };
    } else if (
      fileExtension[1] === 'docx' ||
      fileExtension[1] === 'doc' ||
      this.file.data.fileType ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return {
        tag: 'word',
        kind: 'file',
        icon: 'file-word',
        color: 'rgb(75, 135, 228)'
      };
    } else if (
      fileExtension[1] === 'xlsx' ||
      fileExtension[1] === 'xls' ||
      this.file.data.fileType ===
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    ) {
      return {
        tag: 'excel',
        kind: 'file',
        icon: 'file-excel',
        color: 'rgb(14, 157, 89)'
      };
    } else if (
      fileExtension[1] === 'pptx' ||
      this.file.data.fileType ===
        'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ) {
      return {
        tag: 'ppt',
        kind: 'file',
        icon: 'file-ppt',
        color: 'rgb(253, 117, 65)'
      };
    } else {
      return {
        tag: 'file',
        kind: 'file',
        icon: 'file',
        color: 'rgb(192,192,192)'
      };
    }
  }

  private mounted() {
    this.file.data.kind = this.fileIcon.kind;
    this.file.saveSync();
    this.attachedTags = this.file.data.tags;
    this.tags = ['design', 'code', 'flow-chart'];
  }
}
