var accessToken = 'ghp_nf8tOOjB8U692';
accessToken += 'UzbzPOUPA9XlxHMek3MGsNC';
const url = new URL(window.location.toLocaleString());
const commitIndex = url.searchParams.get('commitIndex');

function changeFavicon(src) {
  var link = document.createElement('link');
  link.type = 'image/x-icon';
  link.rel = 'icon';
  link.href = src;
  document.getElementsByTagName('head')[0].appendChild(link);
}


(async () => {
  const commitCount = (await (await fetch('https://api.github.com/repos/landgreen/n-gon/contributors', {
  headers: {
    'Authorization': `Bearer ${accessToken}`
  }
})).json())[0].contributions;

  var allCommits = [];
  for (var i = 0; i < (commitCount / 100) - 1; i++) {
    const commits = await (await fetch(`https://api.github.com/repos/landgreen/n-gon/commits?per_page=100&page=${i}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      }
    })).json();
    allCommits = allCommits.concat(commits)
  }
  const commits = await (await fetch(`https://api.github.com/repos/landgreen/n-gon/commits?per_page=${commitCount % 100}&page=${Math.floor(commitCount) / 100}`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })).json();
  allCommits = allCommits.concat(commits);
  allCommits.sort((a, b) => (new Date(a.commit.author.date).getTime()) - (new Date(b.commit.author.date)).getTime());

  var index;
  if (commitIndex == null) {
    index = Math.floor(Math.random() * allCommits.length);
  } else {
    index = parseInt(commitIndex) + 1;
    if (index >= allCommits.length) index = allCommits.length - 1;
  }
  const sha = allCommits[index].sha;
  const treeSha = allCommits[index].commit.tree.sha;
  const date = new Date(allCommits[index].commit.author.date);
  console.log(`Using commit ${index} from ${date.getMonth() + 1}/${date.getDate() + 1}/${date.getFullYear()} (DD/MM/YYYY)`)
  console.log(`https://github.com/landgreen/n-gon/tree/${sha}`)
  const files = (await (await fetch(`https://api.github.com/repos/landgreen/n-gon/git/trees/${sha}?recursive=true`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  })).json()).tree;

  for (const file of files) {
    if (file.path == 'index.html') {
      var html = await (await fetch(`https://raw.githubusercontent.com/landgreen/n-gon/${sha}/index.html`)).text()
      const cssText = await (await fetch(`https://raw.githubusercontent.com/landgreen/n-gon/${sha}/style.css`)).text();
      html = html.replace('<link rel="stylesheet" href="style.css">', `<style>\n${cssText}\n</style>`)
      html = html.replace('favicon.ico', `https://raw.githubusercontent.com/landgreen/n-gon/${sha}/favicon.ico`)
      var scripts = [];
      var rawScripts = html.split("<script src='");
      for (var i = 1; i < rawScripts.length; i++) {
        const path = rawScripts[i].substring(0, rawScripts[i].indexOf("'"));
        scripts.push(path);
      }
      var rawScripts = html.split('<script src="');
      for (var i = 1; i < rawScripts.length; i++) {
        const path = rawScripts[i].substring(0, rawScripts[i].indexOf('"'));
        scripts.push(path);
      }
      
      for (const scriptName of scripts) {
        html = html.replace(`<script src="${scriptName}"></script>`, '')
        html = html.replace(`<script src='${scriptName}'></script>`, '')
      }

      changeFavicon(`https://raw.githubusercontent.com/landgreen/n-gon/${sha}/favicon.ico`)
      document.write(html)

      var fullScript = '';
      for (const scriptName of scripts) {
        const scriptText = await (await fetch(`https://raw.githubusercontent.com/landgreen/n-gon/${sha}/${scriptName}`)).text()
        
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.textContent = scriptText;
        document.head.appendChild(script);
      }
    }
  }
})();
