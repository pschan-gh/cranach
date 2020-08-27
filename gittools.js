import { Octokit } from "https://cdn.pika.dev/@octokit/rest";

function commitGh(ghRepoUsername, ghRepo, ghAccessToken) {

	$('#gh_modal .feedback .message').html('');
	console.log( $('#index_text').val() );

	if (ghAccessToken == "") {
		$.post("tokens/index.php", { type: "github", username: ghRepoUsername } ).done(function(token) {
			let octokit = new Octokit({
				auth: token,
			});

			// let gh = new GitHub({
			//     token: token
			// });
			// // Creates an object representing the repository you want to work with
			// let repository = gh.getRepo(ghRepoUsername, ghRepo);
			//
			// // Creates a new file (or updates it if the file already exists)
			// // with the content provided
			ghCommitFile(octokit, ghRepoUsername, ghRepo, $('#ghRepoBranch').val(), $('#localFilenameRoot').text() + '.wb', editor.getValue());
			ghCommitFile(octokit, ghRepoUsername, ghRepo, $('#ghRepoBranch').val(), $('#localFilenameRoot').text() + '.xml', $('#cranach_text').val());
			ghCommitFile(octokit, ghRepoUsername, ghRepo, $('#ghRepoBranch').val(), 'index.xml', $('#index_text').val());
		});
	} else {
		let octokit = new Octokit({
			auth: ghAccessToken,
		});
		ghCommitFile(octokit, ghRepoUsername, ghRepo, $('#ghRepoBranch').val(), $('#localFilenameRoot').text() + '.wb', editor.getValue());
		ghCommitFile(octokit, ghRepoUsername, ghRepo, $('#ghRepoBranch').val(), $('#localFilenameRoot').text() + '.xml', $('#cranach_text').val());
		ghCommitFile(octokit, ghRepoUsername, ghRepo, $('#ghRepoBranch').val(), 'index.xml', $('#index_text').val());
		// let gh = new GitHub({
		//     token: ghAccessToken
		// });
		// let repository = gh.getRepo(ghRepoUsername, ghRepo);
		// ghCommitFile(repository, $('#ghRepoBranch').val(), $('#localFilenameRoot').text() + '.wb', editor.getValue());
		// ghCommitFile(repository, $('#ghRepoBranch').val(), $('#localFilenameRoot').text() + '.xml', $('#cranach_text').val());
		// ghCommitFile(repository, $('#ghRepoBranch').val(), 'index.xml', $('#index_text').val());
	}
}
window.commitGh = commitGh;

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
		let sha = result.data.sha;
		console.log(sha);
		octokit.repos.createOrUpdateFileContents({
			owner: owner,
			repo: repo,
			path: filename,
			message: 'Update ' + filename,
			content: btoa(string),
			branch: branch,
			sha: sha
		}).then(response => {
			console.log(response.status);
			$('#gh_modal .feedback .message').append('<div><code>Status ' + response.status +  ' ' + filename + ' pushed.</code></div>');
		}).catch(err => {
			$('#gh_modal .feedback .message').append('<div><code> ' + filename + ': ' +  err + '</code></div>');
		});
		$('#gh_modal .loading').hide();
	})

	// repo.writeFile(
	//     branch, // e.g. 'master'
	//     filename, // e.g. 'blog/index.md'
	//     string, // e.g. 'Hello world, this is my new content'
	//     'update' + ' ' + filename, // e.g. 'Created new index'
	//     function(err) {
	//         if (err) {
	//             $('#gh_modal .feedback .message').append('<div><code>' + err + '</code></div>');
	//         } else {
	//             $('#gh_modal .feedback .message').append('<div><code>' + filename + ' pushed.</code></div>');
	//         }
	//         $('#gh_modal .loading').hide();
	//     }
	// );
}
