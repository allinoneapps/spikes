const httpClient = require('request-promise-native');

function Coverage(config) {
  this.apiKey = config.apiKey;
}

Coverage.prototype.rank = 1;

Coverage.prototype.rule = function() {
  return httpClient(createProjectRequest(this.apiKey))
    .then(parseProjects)
    .then(toAllCoverage(this.apiKey))
    .then(toRuleResult);
}

function createProjectRequest(apiKey) {
  return {
    url: 'https://sonar.novoda.com/api/projects/index',
    auth: {
      user: apiKey,
      pass: '',
    }
  };
}

let currentIndex = 0;

function parseProjects(body) {
  const jsonBody = JSON.parse(body);
  const results = jsonBody.map(each => {
    return {
      name: each.nm,
      key: each.k
    }
  });
  return Promise.resolve(results);
}

function toAllCoverage(apiKey) {
  return function (data) {
    const allCoverage = data.map(each => {
      const coverageRequest = createCoverageRequest(apiKey, each.key);
      return httpClient(coverageRequest)
        .then(parseCoverage(each.name));
    });
    return Promise.all(allCoverage);
  };
}

function createCoverageRequest(apiKey, componentKey) {
  return {
    url:  'https://sonar.novoda.com/api/measures/component',
    qs: {
      componentKey: componentKey,
      metricKeys: 'coverage'
    },
    auth: {
      user: apiKey,
      pass: '',
    }
  };
}

function parseCoverage(projectName) {
  return function(body) {
    const jsonBody = JSON.parse(body);
    const measures = jsonBody.component.measures;
    if (measures && measures.length > 0) {
      return Promise.resolve({
        project: projectName,
        coverage: measures[0].value
      });
    } else {
      return Promise.resolve({});
    }
  }
}

function toRuleResult(data) {
  const filtered = data.filter(each => {
    return each.project;
  });

  incrementIndex(filtered.length);

  return Promise.resolve({
    widgetKey: 'coverage',
    payload: filtered[currentIndex]
  });
}

function incrementIndex(dataLength) {
  if (currentIndex >= dataLength - 1) {
    currentIndex = 0;
  } else {
    currentIndex++;
  }
}

module.exports = Coverage;