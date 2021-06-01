import { Octokit } from "https://cdn.skypack.dev/@octokit/rest@18.5.3";
import { createPullRequest } from "https://cdn.skypack.dev/octokit-plugin-create-pull-request";
const MyOctokit = Octokit.plugin(createPullRequest);

function commitGh(ghRepoUsername, ghRepo, ghAccessToken) {

	$('#gh_modal .feedback .message').html('');
	console.log( $('#index_text').val() );

	if (ghAccessToken == "") {
		$.post("tokens/index.php", { type: "github", username: ghRepoUsername } ).done(function(token) {
			let octokit = new MyOctokit({
				auth: token,
			});

			ghCommitFiles(octokit, ghRepoUsername, ghRepo, $('#ghRepoBranch').val(), $('#localFilenameRoot').text());
		});
	} else {
		let octokit = new MyOctokit({
			auth: ghAccessToken,
		});
		ghCommitFiles(octokit, ghRepoUsername, ghRepo, $('#ghRepoBranch').val(), $('#localFilenameRoot').text());
	}
}
window.commitGh = commitGh;

function ghCommitFiles(octokit, owner, repo, branch, fileroot) {

	let wbFile = fileroot + '.wb';
	let xmlFile = fileroot + '.xml';

	$('#gh_modal .loading').show();
	$('#gh_modal .feedback .message').append('<div><code>Sending pull request: ' + wbFile + ', ' + xmlFile + ', index.xml.</code></div>');

	octokit.createPullRequest({
    owner: owner,
    repo: repo,
    title: "Update " + fileroot,
    body: "",
    base: branch /* optional: defaults to default branch */,
    head: "patch",
    changes: [
		{
		  /* optional: if `files` is not passed, an empty commit is created instead */
		  files:  {
			  [wbFile] : editor.getValue(),
			  [xmlFile] : $('#cranach_text').val(),
			  "index.xml" : $('#index_text').val()
		  },
        commit:
          "Update " + fileroot,
      },
    ],
  })
  .then((pr) => {
	  console.log(pr);
	  $('#gh_modal .feedback .message').append('<div><a target="_blank" href="' + pr.data.html_url + '"> ' + pr.data.html_url +  '</a></div>');
	  $('#gh_modal .loading').hide();
  })
  .catch(err => {
	  $('#gh_modal .feedback .message').append('<div><code>' +  err + '</code></div>');
	  $('#gh_modal .loading').hide();
  });

}

function ghCommitFile(octokit, owner, repo, branch, filename, string) {
	// console.log(repo);
	// console.log(filename);
	// console.log(string);

	$('#gh_modal .loading').show();

	octokit.repos.getContent({
		owner: owner,
		repo: repo,
		path: filename,
		ref: branch
	}).then(result => {
		console.log(result);
		var sha = result.data.sha;
		console.log(filename + ' ' + sha);
		return octokit.repos.createOrUpdateFileContents({
			owner: owner,
			repo: repo,
			path: filename,
			message: 'update ' + filename,
			content: btoa(string),
			branch: branch,
			sha: sha
		}).then(response => {
			console.log(response.status);
			$('#gh_modal .feedback .message').append('<div><code>Status ' + response.status +  ' ' + filename + ' pushed.</code></div>');
			$('#gh_modal .loading').hide();
		}).catch(err => {
			$('#gh_modal .feedback .message').append('<div><code> ' + filename + ': ' +  err + '</code></div>');
			$('#gh_modal .loading').hide();
		});
	});
}
