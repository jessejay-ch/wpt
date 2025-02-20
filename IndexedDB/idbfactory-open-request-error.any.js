// META: title=IDBFactory open(): request properties on error
// META: global=window,worker
// META: script=resources/support.js

// Spec: https://w3c.github.io/IndexedDB/#dom-idbfactory-open

'use strict';

let saw_abort = false;

indexeddb_test(
    (t, db, tx, rq) => {
      const store = db.createObjectStore('store');
      store.put({name: 'a'}, 1);
      store.put({name: 'a'}, 2);
      store.createIndex('index', 'name', {unique: true});

      assert_equals(
          rq.readyState, 'done',
          'request done flag should be set during upgradeneeded');
      assert_equals(
          rq.result, db,
          'request result should be set (to connection) during upgradeneeded');
      assert_equals(
          rq.error, null, 'request result should be null during upgradeneeded');

      tx.oncomplete = t.unreached_func('transaction should abort');
      tx.onabort = t.step_func(() => {
        saw_abort = true;

        assert_equals(
            rq.readyState, 'done',
            'request done flag should still be set during abort');

        // Chrome is flaky here. See: https://crbug.com/723846
        /*
        assert_equals(
          rq.result, db,
          'request result should still be set (to connection) during abort');
        assert_equals(
          rq.error, null,
          'request result should still be null during abort');
        */
      });

      rq.onerror = t.step_func(() => {
        assert_true(saw_abort, 'abort event should fire before error');
        assert_equals(
            rq.readyState, 'done', 'request done flag should be set on error');
        assert_equals(
            rq.result, undefined,
            'request result should be undefined on error');
        assert_equals(
            rq.error.name, 'AbortError',
            'request error should be AbortError on error');
        t.done();
      });
    },
    (t, db) => {},
    'Properties of IDBOpenDBRequest during failed IDBFactory open()',
    {upgrade_will_abort: true});
