/**
 * Copyright 2004-present Facebook. All Rights Reserved.
 *
 * This file is shared between www and fbsource and www is the source of truth.
 * When you make change to this file on www, please make sure you test it on
 * fbsource and send a diff to update the files too so that the 2 versions are
 * kept in sync.
 *
 * Run the following command to sync the change from www to fbsource.
 *   js1 upgrade www-shared -p fbt --local ~/www
 *
 * @emails oncall+internationalization
 * @format
 * @flow
 */

jest.disableAutomock();

const FbtHooks = require('FbtHooks');
const FbtResult = require('FbtResult');

const nullthrows = require('nullthrows');

let _errorListener;

describe('FbtResult', function() {
  beforeEach(() => {
    jest.resetModules();
    _errorListener = FbtHooks.getErrorListener({
      hash: 'h',
      translation: 't',
    });
  });

  it('can be flattened into array', function() {
    const errorListener = nullthrows(_errorListener);
    let obj1 = new FbtResult(['prefix'], errorListener);

    const obj2 = new FbtResult(['suffix'], errorListener);

    let obj3 = new FbtResult([obj1, 'content', obj2], errorListener);
    expect(
      // flow doesn't think FbtResult.flattenToArray exists because of
      // our egregious lies spat out in module.exports of FbtResultBase.js
      // $FlowFixMe[prop-missing] flattenToArray
      obj3.flattenToArray().join(' '),
    ).toBe('prefix content suffix');

    obj1 = new FbtResult(['prefix'], errorListener);

    // $FlowExpectedError[incompatible-cast]
    const stringable = ({
      toString() {
        return 'stringable';
      },
    }: $FbtContentItem);

    obj3 = new FbtResult([obj1, 'content', stringable], errorListener);
    expect(
      // flow doesn't think FbtResult.flattenToArray exists because of
      // our egregious lies spat out in module.exports of FbtResultBase.js
      // $FlowFixMe[prop-missing] flattenToArray
      obj3.flattenToArray().join(' '),
    ).toBe('prefix content stringable');
  });

  it('implements common string methods', function() {
    const errorListener = nullthrows(_errorListener);
    const result = new FbtResult(['kombucha'], errorListener);

    // $FlowFixMe[cannot-write] We're mocking a read-only property (method) below
    const err = (console.error = jest.fn());
    expect(result.substr(0, 3)).toBe('kom');
    expect(err.mock.calls.length).toBe(1);
    expect(result.slice(1, 3)).toBe('om');
    expect(err.mock.calls.length).toBe(2);
  });

  it('does not invoke onStringSerializationError() when being serialized with valid-FBT contents', function() {
    const errorListener = nullthrows(_errorListener);
    const result = new FbtResult(
      ['hello', new FbtResult(['world'], errorListener)],
      errorListener,
    );
    // $FlowFixMe[cannot-write] We're mocking a read-only property (method) below
    errorListener.onStringSerializationError = jest.fn();
    result.toString();
    expect(errorListener?.onStringSerializationError).not.toHaveBeenCalled();
  });
});
