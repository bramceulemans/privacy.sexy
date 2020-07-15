import { BaseEntity } from '@/infrastructure/Entity/BaseEntity';
import { ICategory, IScript } from '@/domain/ICategory';
import { ScriptStub } from './ScriptStub';

export class CategoryStub extends BaseEntity<number> implements ICategory  {
    public name = `category-with-id-${this.id}`;
    public readonly subCategories = new Array<ICategory>();
    public readonly scripts = new Array<IScript>();
    public readonly documentationUrls = new Array<string>();

    constructor(id: number) {
        super(id);
    }
    public withScriptIds(...scriptIds: string[]): CategoryStub {
        for (const scriptId of scriptIds) {
            this.withScript(new ScriptStub(scriptId));
        }
        return this;
    }
    public withScripts(...scripts: IScript[]): CategoryStub {
        for (const script of scripts) {
            this.withScript(script);
        }
        return this;
    }
    public withScript(script: IScript): CategoryStub {
        this.scripts.push(script);
        return this;
    }
    public withName(categoryName: string) {
        this.name = categoryName;
        return this;
    }
}
