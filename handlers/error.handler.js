const utils = require('../utils/utils');
const logger = require('../utils/logger');
const messageFormatter = require('../utils/message-formatter');

async function errorHandler(data) {
  const gh = utils.getGithubApi();
  const {
    errorTemplate,
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
  } = data;

  const contents = await messageFormatter.error(
    errorTemplate,
    owner,
    repo,
    branch,
    author,
    pullRequestAuthor,
  );

  logger.log('Attempting to create error comment in PR', data);
  const issues = gh.getIssues(owner, repo);

  try {
    const commentResult = await issues.createIssueComment(data.pullRequest, contents);
    const commentId = commentResult.data.id;

    const pullRequestUrl = `https://github.com/${owner}/${repo}/pull/${data.pullRequest}#issuecomment-${commentId}`;
    logger.log(`Comment created successfuly: ${pullRequestUrl}`, Object.assign({}, data, { commentContent: contents }));
  } catch (error) {
    logger.error('Could not create comment', { data, error });
    throw error;
  }

  try {
    utils.starRepo(owner, repo);
  } catch (e) {
    logger.error(e);
  }
}

module.exports = errorHandler;
