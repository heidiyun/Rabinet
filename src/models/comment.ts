import { FirestoreDocumentData } from '@/vue-common';

export default class Comment extends FirestoreDocumentData {
  public uid: string = '';
  public pid: string = '';
  public fid: string | undefined;
  public uploadDate: string = '';
  public content: string = '';
  public isProject: boolean = false;
}
