export class Update {
    public alt?: string = '';
    public caption?: string = '';
    public id?: number = null;
    public imgurl?: string = '';
    public thumbnail?: string = '';
    public chapter?: string = '';

    constructor(id?: number){
        this.id = id;
    }
}
