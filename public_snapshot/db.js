// Portfolio snapshot DB adapter.
//
// This repo is intended to be public; we keep the *shape* of the DB client while
// removing any real connection details, schema, and queries.

function emptyResult() {
  return { rowCount: 0, rows: [] };
}

const dbClient = {
  async query(_sql, _params) {
    return emptyResult();
  },
  async connect() {
    return {
      async query(_sql, _params) {
        return emptyResult();
      },
      release() {}
    };
  },
  async end() {},
  on() {}
};

export default dbClient;