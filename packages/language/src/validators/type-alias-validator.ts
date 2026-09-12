import type { ValidationAcceptor } from 'langium';
import { type TypeAlias } from '../generated/ast';
import { validateAttributeApplication } from './attribute-application-validator';
import { type AstValidator } from './common';

/**
 * Validates type alias declarations.
 */
export default class TypeAliasValidator implements AstValidator<TypeAlias> {
    validate(typeAlias: TypeAlias, accept: ValidationAcceptor): void {
        this.validateAttributes(typeAlias, accept);
        this.validateThisField(typeAlias, accept);
    }

    private validateAttributes(typeAlias: TypeAlias, accept: ValidationAcceptor) {
        typeAlias.attributes.forEach((attr) => validateAttributeApplication(attr, accept));
        typeAlias.this.attributes.forEach((attr) => validateAttributeApplication(attr, accept));
    }

    private validateThisField(typeAlias: TypeAlias, accept: ValidationAcceptor) {
        const thisField = typeAlias.this;
        if (thisField.type !== typeAlias.type) {
            accept('error', `\`this\` field type must match type alias declaration type`, {
                node: thisField,
            });
        }
    }
}
