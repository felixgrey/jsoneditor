import test from 'ava';
import {
    jsonToData, dataToJson, expand, patchData, pathExists,
    parseJSONPointer, compileJSONPointer
} from '../src/jsonData'


const JSON_EXAMPLE = {
  obj: {
    arr: [1,2, {a:3,b:4}]
  },
  str: 'hello world',
  nill: null,
  bool: false
}

const JSON_DATA_EXAMPLE = {
  type: 'object',
  expanded: true,
  props: [
    {
      name: 'obj',
      value: {
        type: 'object',
        expanded: true,
        props: [
          {
            name: 'arr',
            value: {
              type: 'array',
              expanded: true,
              items: [
                {
                  type: 'value',
                  value: 1
                },
                {
                  type: 'value',
                  value: 2
                },
                {
                  type: 'object',
                  expanded: true,
                  props: [
                    {
                      name: 'a',
                      value: {
                        type: 'value',
                        value: 3
                      }
                    },
                    {
                      name: 'b',
                      value: {
                        type: 'value',
                        value: 4
                      }
                    }
                  ]
                },
              ]
            }
          }
        ]
      }
    },
    {
      name: 'str',
      value: {
        type: 'value',
        value: 'hello world'
      }
    },
    {
      name: 'nill',
      value: {
        type: 'value',
        value: null
      }
    },
    {
      name: 'bool',
      value: {
        type: 'value',
        value: false
      }
    }
  ]
}

const JSON_DATA_EXAMPLE_COLLAPSED_1 = {
  type: 'object',
  expanded: true,
  props: [
    {
      name: 'obj',
      value: {
        type: 'object',
        expanded: true,
        props: [
          {
            name: 'arr',
            value: {
              type: 'array',
              expanded: true,
              items: [
                {
                  type: 'value',
                  value: 1
                },
                {
                  type: 'value',
                  value: 2
                },
                {
                  type: 'object',
                  expanded: false,
                  props: [
                    {
                      name: 'a',
                      value: {
                        type: 'value',
                        value: 3
                      }
                    },
                    {
                      name: 'b',
                      value: {
                        type: 'value',
                        value: 4
                      }
                    }
                  ]
                },
              ]
            }
          }
        ]
      }
    },
    {
      name: 'str',
      value: {
        type: 'value',
        value: 'hello world'
      }
    },
    {
      name: 'nill',
      value: {
        type: 'value',
        value: null
      }
    },
    {
      name: 'bool',
      value: {
        type: 'value',
        value: false
      }
    }
  ]
}

const JSON_DATA_EXAMPLE_COLLAPSED_2 = {
  type: 'object',
  expanded: true,
  props: [
    {
      name: 'obj',
      value: {
        type: 'object',
        expanded: false,
        props: [
          {
            name: 'arr',
            value: {
              type: 'array',
              expanded: false,
              items: [
                {
                  type: 'value',
                  value: 1
                },
                {
                  type: 'value',
                  value: 2
                },
                {
                  type: 'object',
                  expanded: false,
                  props: [
                    {
                      name: 'a',
                      value: {
                        type: 'value',
                        value: 3
                      }
                    },
                    {
                      name: 'b',
                      value: {
                        type: 'value',
                        value: 4
                      }
                    }
                  ]
                },
              ]
            }
          }
        ]
      }
    },
    {
      name: 'str',
      value: {
        type: 'value',
        value: 'hello world'
      }
    },
    {
      name: 'nill',
      value: {
        type: 'value',
        value: null
      }
    },
    {
      name: 'bool',
      value: {
        type: 'value',
        value: false
      }
    }
  ]
}

test('jsonToData', t => {
  function expand (path) {
    return true
  }

  t.deepEqual(jsonToData([], JSON_EXAMPLE, expand), JSON_DATA_EXAMPLE)
})

test('dataToJson', t => {
  t.deepEqual(dataToJson(JSON_DATA_EXAMPLE), JSON_EXAMPLE)
})

test('expand a single path', t => {
  const collapsed = expand(JSON_DATA_EXAMPLE, ['obj', 'arr', 2], false)

  t.deepEqual(collapsed, JSON_DATA_EXAMPLE_COLLAPSED_1)
})

test('expand a callback', t => {
  function callback (path) {
    return path.length >= 1
  }
  const expanded = false
  const collapsed = expand(JSON_DATA_EXAMPLE, callback, expanded)

  t.deepEqual(collapsed, JSON_DATA_EXAMPLE_COLLAPSED_2)
})

test('expand a callback should not change the object when nothing happens', t => {
  function callback (path) {
    return false
  }
  const expanded = false
  const collapsed = expand(JSON_DATA_EXAMPLE, callback, expanded)

  t.is(collapsed, JSON_DATA_EXAMPLE)
})

test('pathExists', t => {
  t.is(pathExists(JSON_DATA_EXAMPLE, ['obj', 'arr', 2, 'a']), true)
  t.is(pathExists(JSON_DATA_EXAMPLE, ['obj', 'foo']), false)
  t.is(pathExists(JSON_DATA_EXAMPLE, ['obj', 'foo', 'bar']), false)
  t.is(pathExists(JSON_DATA_EXAMPLE, []), true)
})

test('parseJSONPointer', t => {
  t.deepEqual(parseJSONPointer('/obj/a'), ['obj', 'a'])
  t.deepEqual(parseJSONPointer('/arr/-'), ['arr', '-'])
  t.deepEqual(parseJSONPointer('/foo/~1~0 ~0~1'), ['foo', '/~ ~/'])
})

test('compileJSONPointer', t => {
  t.deepEqual(compileJSONPointer(['foo', 'bar']), '/foo/bar')
  t.deepEqual(compileJSONPointer(['foo', '/~ ~/']), '/foo/~1~0 ~0~1')
})

test('jsonpatch add', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 2}
  }

  const patch = [
    {op: 'add', path: '/obj/b', value: {foo: 'bar'}}
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  t.deepEqual(patchedJson, {
    arr: [1,2,3],
    obj: {a : 2, b: {foo: 'bar'}}
  })
  t.deepEqual(revert, [
    {op: 'remove', path: '/obj/b'}
  ])
})

test('jsonpatch add: append to matrix', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 2}
  }

  const patch = [
    {op: 'add', path: '/arr/-', value: 4}
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  t.deepEqual(patchedJson, {
    arr: [1,2,3,4],
    obj: {a : 2}
  })
  t.deepEqual(revert, [
    {op: 'remove', path: '/arr/3'}
  ])
})


test('jsonpatch remove', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 4}
  }

  const patch = [
    {op: 'remove', path: '/obj/a'},
    {op: 'remove', path: '/arr/1'},
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  t.deepEqual(patchedJson, {
    arr: [1,3],
    obj: {}
  })
  t.deepEqual(revert, [
    {op: 'add', path: '/arr/1', value: 2},
    {op: 'add', path: '/obj/a', value: 4}
  ])

  // test revert
  const data2 = jsonToData([], patchedJson, (path) => false)
  const result2 = patchData(data2, revert)
  const patchedData2 = result2.data
  const revert2 = result2.revert
  const patchedJson2 = dataToJson(patchedData2)

  t.deepEqual(patchedJson2, json)
  t.deepEqual(revert2, patch)
})

test('jsonpatch replace', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 4}
  }

  const patch = [
    {op: 'replace', path: '/obj/a', value: 400},
    {op: 'replace', path: '/arr/1', value: 200},
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  t.deepEqual(patchedJson, {
    arr: [1,200,3],
    obj: {a: 400}
  })
  t.deepEqual(revert, [
    {op: 'replace', path: '/arr/1', value: 2},
    {op: 'replace', path: '/obj/a', value: 4}
  ])

  // test revert
  const data2 = jsonToData([], patchedJson, (path) => false)
  const result2 = patchData(data2, revert)
  const patchedData2 = result2.data
  const revert2 = result2.revert
  const patchedJson2 = dataToJson(patchedData2)

  t.deepEqual(patchedJson2, json)
  t.deepEqual(revert2, patch)
})

test('jsonpatch copy', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 4}
  }

  const patch = [
    {op: 'copy', from: '/obj', path: '/arr/2'},
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  t.deepEqual(patchedJson, {
    arr: [1, 2, {a:4}, 3],
    obj: {a: 4}
  })
  t.deepEqual(revert, [
    {op: 'remove', path: '/arr/2'}
  ])

  // test revert
  const data2 = jsonToData([], patchedJson, (path) => false)
  const result2 = patchData(data2, revert)
  const patchedData2 = result2.data
  const revert2 = result2.revert
  const patchedJson2 = dataToJson(patchedData2)

  t.deepEqual(patchedJson2, json)
  t.deepEqual(revert2, [
    {op: 'add', path: '/arr/2', value: {a: 4}}
  ])
})

test('jsonpatch move', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 4}
  }

  const patch = [
    {op: 'move', from: '/obj', path: '/arr/2'},
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  t.deepEqual(patchedJson, {
    arr: [1, 2, {a:4}, 3]
  })
  t.deepEqual(revert, [
    {op: 'move', from: '/arr/2', path: '/obj'}
  ])

  // test revert
  const data2 = jsonToData([], patchedJson, (path) => false)
  const result2 = patchData(data2, revert)
  const patchedData2 = result2.data
  const revert2 = result2.revert
  const patchedJson2 = dataToJson(patchedData2)

  t.deepEqual(patchedJson2, json)
  t.deepEqual(revert2, patch)
})

test('jsonpatch move and replace', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 4}
  }

  const patch = [
    {op: 'move', from: '/obj', path: '/arr'},
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  t.deepEqual(patchedJson, {
    arr: {a:4}
  })
  t.deepEqual(revert, [
    {op: 'move', from: '/arr', path: '/obj'},
    {op: 'add', path: '/arr', value: [1,2,3]}
  ])

  // test revert
  const data2 = jsonToData([], patchedJson, (path) => false)
  const result2 = patchData(data2, revert)
  const patchedData2 = result2.data
  const revert2 = result2.revert
  const patchedJson2 = dataToJson(patchedData2)

  t.deepEqual(patchedJson2, json)
  t.deepEqual(revert2, [
    {op: 'remove', path: '/arr'},
    {op: 'move', from: '/obj', path: '/arr'}
  ])
})

test('jsonpatch test (ok)', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 4}
  }

  const patch = [
    {op: 'test', path: '/arr', value: [1,2,3]},
    {op: 'add', path: '/added', value: 'ok'}
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  t.deepEqual(patchedJson, {
    arr: [1,2,3],
    obj: {a : 4},
    added: 'ok'
  })
  t.deepEqual(revert, [
    {op: 'remove', path: '/added'}
  ])

})

test('jsonpatch test (fail: path not found)', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 4}
  }

  const patch = [
    {op: 'test', path: '/arr/5', value: [1,2,3]},
    {op: 'add', path: '/added', value: 'ok'}
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  // patch shouldn't be applied
  t.deepEqual(patchedJson, {
    arr: [1,2,3],
    obj: {a : 4}
  })
  t.deepEqual(revert, [])
  t.is(result.error.toString(), 'Error: Test failed, path not found')
})

test('jsonpatch test (fail: value not equal)', t => {
  const json = {
    arr: [1,2,3],
    obj: {a : 4}
  }

  const patch = [
    {op: 'test', path: '/obj', value: {a:4, b: 6}},
    {op: 'add', path: '/added', value: 'ok'}
  ]

  const data = jsonToData([], json, (path) => false)
  const result = patchData(data, patch)
  const patchedData = result.data
  const revert = result.revert
  const patchedJson = dataToJson(patchedData)

  // patch shouldn't be applied
  t.deepEqual(patchedJson, {
    arr: [1,2,3],
    obj: {a : 4}
  })
  t.deepEqual(revert, [])
  t.is(result.error.toString(), 'Error: Test failed, value differs')
})
