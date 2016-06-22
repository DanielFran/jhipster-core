'use strict';

const merge = require('../utils/object_utils').merge,
    isNilOrEmpty = require('../utils/string_utils').isNilOrEmpty,
    buildException = require('../exceptions/exception_factory').buildException,
    exceptions = require('../exceptions/exception_factory').exceptions,
    JDLEntity = require('./jdl_entity'),
    RELATIONSHIP_TYPES = require('./jhipster/relationship_types').RELATIONSHIP_TYPES,
    exists = require('./jhipster/relationship_types').exists;

class JDLRelationship {
  constructor(args) {
    var merged = merge(defaults(), args);
    if (!JDLEntity.isValid(merged.from) || !JDLEntity.isValid(merged.to)) {
      throw new buildException(exceptions.InvalidObject, 'Valid source and destination entities are required.');
    }
    if (!exists(merged.type) || !(merged.injectedFieldInFrom || merged.injectedFieldInTo)) {
      throw new buildException(exceptions.NullPointer, 'The type, and at least one injected field must be passed.');
    }
    this.from = merged.from;
    this.to = merged.to;
    this.type = merged.type;
    this.injectedFieldInFrom = merged.injectedFieldInFrom;
    this.injectedFieldInTo = merged.injectedFieldInTo;
    this.commentInFrom = merged.commentInFrom;
    this.commentInTo = merged.commentInTo;
  }

  static isValid(relationship) {
    return relationship != null && exists(relationship.type)
        && 'from' in relationship && JDLEntity.isValid(relationship.from)
        && 'to' in relationship && JDLEntity.isValid(relationship.to)
        && (('injectedFieldInFrom' in relationship && relationship.injectedFieldInFrom != null)
        || ('injectedFieldInTo' in relationship && relationship.injectedFieldInTo != null));
  }

  /**
   * Returns a constructed ID representing this relationship.
   * @return {String} the relationship's id.
   */
  getId() {
    return `${this.type}_${this.from.name}${(this.injectedFieldInFrom) ? `{${this.injectedFieldInFrom}}` : ''}_${this.to.name}${(this.injectedFieldInTo) ? `${this.injectedFieldInTo}` : ''}`;
  }

  /**
   * Checks the validity of the relationship.
   * @throws NullPointerException if the association is nil.
   * @throws AssociationException if the association is invalid.
   */
  validate() {
    let sourceName = this.from.name, destinationName = this.to.name;
    if (!this || !this.type) {
      throw new buildException(
          exceptions.NullPointer, 'The association must not be nil.');
    }
    switch (this.type) {
      case RELATIONSHIP_TYPES.ONE_TO_ONE:
        if (!this.injectedFieldInFrom) {
          throw new buildException(
              exceptions.MalformedAssociation,
              `In the One-to-One relationship from ${sourceName} to ${destinationName}, `
              + 'the source entity must possess the destination in a One-to-One '
              + ' relationship, or you must invert the direction of the relationship.');
        }
        break;
      case RELATIONSHIP_TYPES.ONE_TO_MANY:
        if (!this.injectedFieldInFrom || !this.injectedFieldInTo) {
          console.warn(
                  `In the One-to-Many relationship from ${sourceName} to  ${destinationName}, `
                  + 'only bidirectionality is supported for a One-to-Many association. '
                  + 'The other side will be automatically added.');
        }
        break;
      case RELATIONSHIP_TYPES.MANY_TO_ONE:
        if (this.injectedFieldInFrom && this.injectedFieldInTo) {
          throw new buildException(
              exceptions.MalformedAssociation,
              `In the Many-to-One relationship from ${sourceName} to ${destinationName}, `
              + 'only unidirectionality is supported for a Many-to-One relationship, '
              + 'you should create a bidirectional One-to-Many relationship instead.');
        }
        break;
      case RELATIONSHIP_TYPES.MANY_TO_MANY:
        if (!this.injectedFieldInFrom || !this.injectedFieldInTo) {
          throw new buildException(
              exceptions.MalformedAssociation,
              `In the Many-to-Many relationship from ${sourceName} to ${destinationName}, `
              + 'only bidirectionality is supported for a Many-to-Many relationship.');
        }
        break;
      default:
        throw new buildException(
            exceptions.WrongAssociation,
            `The association type ${association.type} isn't supported.`);
    }
  }

  toString() {
    var string = `relationship ${this.type} {\n  `;
    if (this.commentInFrom) {
      string += `/**
   * ${this.commentInFrom}
   */\n  `;
    }
    string += `${this.from.name}`;
    if (this.injectedFieldInFrom) {
      string += `{${this.injectedFieldInFrom}}`
    }
    string += ' to';
    if (this.commentInTo) {
      string += `
  /**
   * ${this.commentInTo}
   */\n  `;
    } else {
      string += ' ';
    }
    string += `${this.to.name}`;
    if (this.injectedFieldInTo) {
      string += `{${this.injectedFieldInTo}}`;
    }
    string += '\n}';
    return string;
  }
}

module.exports = JDLRelationship;

function defaults() {
  return {
    type: RELATIONSHIP_TYPES.ONE_TO_ONE,
    injectedFieldInFrom: null,
    injectedFieldInTo: null,
    commentInFrom: '',
    commentInTo: ''
  };
}