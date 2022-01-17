// import { Octokit } from "https://cdn.skypack.dev/@octokit/rest@18.5.3";
import { Octokit } from "https://cdn.skypack.dev/@octokit/rest";
import { createPullRequest } from "https://cdn.skypack.dev/octokit-plugin-create-pull-request";
const MyOctokit = Octokit.plugin(createPullRequest);

function commitGh(ghRepoUsername, ghRepo, ghHead, ghAccessToken) {
	const ghModal = document.getElementById('gh_modal');
	const ghRepoBranch = document.getElementById('ghRepoBranch');
	const localFilenameRoot = document.getElementById('localFilenameRoot');


	ghModal.querySelector('.feedback .message').innerHTML = '';

	if (ghAccessToken == "") {
		fetch("tokens/index.php", {
			method: 'POST',
			headers: {
				"Content-type": "application/x-www-form-urlencoded; charset=UTF-8"
			},
			body: `type=github&username=${ghRepoUsername}`
		}).then(function(response) {
			if (!response.ok) {
				throw Error("CANNOT OBTAIN TOKEN.");
			}
			return response.text();
		}).then(token => {
			console.log(token);
			console.log('token obtained');
			const octokit = new MyOctokit({
				auth: token,
			});
			ghCommitFiles(octokit, ghRepoUsername, ghRepo, ghHead, ghRepoBranch.value, localFilenameRoot.textContent);
		}).catch(error => {
			console.log(error);
		});
	} else {
		const octokit = new MyOctokit({
			auth: ghAccessToken,
		});
		ghCommitFiles(octokit, ghRepoUsername, ghRepo, ghHead, ghRepoBranch.value, localFilenameRoot.textContent);
	}
}
window.commitGh = commitGh;

function ghCommitFiles(octokit, owner, repo, head, branch, fileroot) {

	// console.log(`${octokit}`)
	// console.log(`${owner}, ${repo}, ${head}, ${branch}, ${fileroot}`);

	// console.log(editor.getValue());
	// console.log(document.getElementById('cranach_text').value);
	// console.log(document.getElementById('index_text').value);

	const ghModal = document.getElementById('gh_modal');
	const wbFile = fileroot + '.wb';
	const xmlFile = fileroot + '.xml';

	ghModal.querySelector('.loading').classList.remove('hidden');

	let messageDiv = document.createElement('div');
	messageDiv.innerHTML = `<code>Sending pull request: ${wbFile}, ${xmlFile}, index.xml.</code>`;

	ghModal.querySelector('.feedback .message').appendChild(messageDiv.cloneNode(true));

	console.log(octokit);
	octokit.createPullRequest({
		owner: owner,
		repo: repo,
		title: "Update " + fileroot,
		body: "",
		base: branch /* optional: defaults to default branch */,
		head: head,
		changes: [
			{
				/* optional: if `files` is not passed, an empty commit is created instead */
				files:  {
					[wbFile] : editor.getValue(),
					[xmlFile] : document.getElementById('cranach_text').value,
					"index.xml" : document.getElementById('index_text').value
				},
				commit:
				"Update " + fileroot,
			},
		],
	})
	.then((pr) => {
		console.log(pr);
		messageDiv.innerHTML = `<a target="_blank" href="${pr.data.html_url}">${pr.data.html_url} </a>`;
		ghModal.querySelector('.feedback .message').appendChild(messageDiv.cloneNode(true));
		ghModal.querySelector('.loading').classList.add('hidden');
	})
	.catch(err => {
		messageDiv.innerHTML = `<code>${err}</code>`;
		ghModal.querySelector('.feedback .message').appendChild(messageDiv.cloneNode(true));
		ghModal.querySelector('.loading').classList.add('hidden');
	});

}

// function ghCommitFile(octokit, owner, repo, branch, filename, string) {
// 	const ghModal = document.getElementById('gh_modal');
//
// 	ghModal.querySelector('.loading').classList.remove('hidden');
//
// 	let messageDiv = document.createElement('div');
//
// 	octokit.repos.getContent({
// 		owner: owner,
// 		repo: repo,
// 		path: filename,
// 		ref: branch
// 	}).then(result => {
// 		console.log(result);
// 		var sha = result.data.sha;
// 		console.log(filename + ' ' + sha);
// 		return octokit.repos.createOrUpdateFileContents({
// 			owner: owner,
// 			repo: repo,
// 			path: filename,
// 			message: 'update ' + filename,
// 			content: btoa(string),
// 			branch: branch,
// 			sha: sha
// 		}).then(response => {
// 			console.log(response.status);
// 			messageDiv.innerHTML = '<code>Status ' + response.status +  ' ' + filename + ' pushed.</code>';
// 			ghModal.querySelector('.feedback .message').appendChild(messageDiv.cloneNode());
// 			ghModal.querySelector('.loading').classList.add('hidden');
// 		}).catch(err => {
// 			messageDiv.innerHTML = '<code> ' + filename + ': ' +  err + '</code>';
// 			ghModal.querySelector('.feedback .message').appendChild(messageDiv.cloneNode());
// 			ghModal.querySelector('.loading').classList.add('hidden');
// 		});
// 	});
// }

document.addEventListener('DOMContentLoaded', () => {
	const ghModal = document.getElementById('gh_modal');
	const ghRepo = document.getElementById('ghRepo');
	const ghRepoUsername = document.getElementById('ghRepoUsername');
	const ghHead = document.getElementById('ghHead');
	const ghAccessToken = document.getElementById('ghAccessToken');

	ghModal.querySelector('button.commit').addEventListener('click', function() {
		commitGh( ghRepoUsername.value, ghRepo.value, ghHead.value, ghAccessToken.value );
		warnClose = false;
	});
});
