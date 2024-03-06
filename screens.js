const homepage=`<div class="search-container">
    <img src="https://i.imgur.com/HX1DIwk.png" alt="Search Icon" class="search-icon"  width="auto" height="auto">
    <input type="text" class="search-input" id="searchInput" placeholder="">
    <button id="searchButton" class="search-button">Search</button>
  </div>
  <div class="homeSearchesContainer">
  <div class="popular-searches">
    <h2>Popular Searches</h2>
    <div class="popular-links">
      <a href="#">SAAS</a>
      <a href="#">IAAS</a>
      <a href="#">PAAS</a>
      <a href="#">Public Cloud</a>
      <a href="#">Private Cloud</a>
    </div>
  </div>
  <div class="rect-searches">
    <h2>Recent Searches</h2>
    <div class="popular-links">
      <a href="#">Recent Search 1</a>
      <a href="#">Recent Search 2</a>
      <a href="#">Recent Search 3</a>
      <a href="#">Recent Search 4</a>
    </div>
  </div>
  </div>`

const searchDiv=`<div class="search-container">
<img src="https://i.imgur.com/HX1DIwk.png" class="search-icon" alt="Search Icon" >
<input type="text" class="search-input" id="searchInput" placeholder="">
<button id="searchButton" class="search-button">Scloud Search</button>
</div>`

const statsScreen=`  <h1 style="text-align:center">Search Engine Statistics</h1>
<div class="Scontainer">
  <div class="chart">
    <canvas id="searchesByWordChart" width="400" height="400"></canvas>
  </div>
  <div class="chart">
    <canvas id="searchesByUserChart" width="400" height="400"></canvas>
  </div>
</div>
<div class="Scontainer">
  <div class="chart">
    <canvas id="commonWordsChart" width="400" height="400"></canvas>
  </div>
  <div class="chart">
    <canvas id="wordFrequencyChart" width="400" height="400"></canvas>
  </div>
</div>`
//porter stemmer
var stemmer = (function(){
  var step2list = {
      "ational" : "ate",
      "tional" : "tion",
      "enci" : "ence",
      "anci" : "ance",
      "izer" : "ize",
      "bli" : "ble",
      "alli" : "al",
      "entli" : "ent",
      "eli" : "e",
      "ousli" : "ous",
      "ization" : "ize",
      "ation" : "ate",
      "ator" : "ate",
      "alism" : "al",
      "iveness" : "ive",
      "fulness" : "ful",
      "ousness" : "ous",
      "aliti" : "al",
      "iviti" : "ive",
      "biliti" : "ble",
      "logi" : "log"
    },

    step3list = {
      "icate" : "ic",
      "ative" : "",
      "alize" : "al",
      "iciti" : "ic",
      "ical" : "ic",
      "ful" : "",
      "ness" : ""
    },

    c = "[^aeiou]",          // consonant
    v = "[aeiouy]",          // vowel
    C = c + "[^aeiouy]*",    // consonant sequence
    V = v + "[aeiou]*",      // vowel sequence

    mgr0 = "^(" + C + ")?" + V + C,               // [C]VC... is m>0
    meq1 = "^(" + C + ")?" + V + C + "(" + V + ")?$",  // [C]VC[V] is m=1
    mgr1 = "^(" + C + ")?" + V + C + V + C,       // [C]VCVC... is m>1
    s_v = "^(" + C + ")?" + v;                   // vowel in stem

  function dummyDebug() {}

  function realDebug() {
    console.log(Array.prototype.slice.call(arguments).join(' '));
  }

  return function (w, debug) {
    var
      stem,
      suffix,
      firstch,
      re,
      re2,
      re3,
      re4,
      debugFunction,
      origword = w;

    if (debug) {
      debugFunction = realDebug;
    } else {
      debugFunction = dummyDebug;
    }

    if (w.length < 3) { return w; }

    firstch = w.substr(0,1);
    if (firstch == "y") {
      w = firstch.toUpperCase() + w.substr(1);
    }

    // Step 1a
    re = /^(.+?)(ss|i)es$/;
    re2 = /^(.+?)([^s])s$/;

    if (re.test(w)) { 
      w = w.replace(re,"$1$2"); 
      debugFunction('1a',re, w);

    } else if (re2.test(w)) {
      w = w.replace(re2,"$1$2"); 
      debugFunction('1a',re2, w);
    }

    // Step 1b
    re = /^(.+?)eed$/;
    re2 = /^(.+?)(ed|ing)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      re = new RegExp(mgr0);
      if (re.test(fp[1])) {
        re = /.$/;
        w = w.replace(re,"");
        debugFunction('1b',re, w);
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1];
      re2 = new RegExp(s_v);
      if (re2.test(stem)) {
        w = stem;
        debugFunction('1b', re2, w);

        re2 = /(at|bl|iz)$/;
        re3 = new RegExp("([^aeiouylsz])\\1$");
        re4 = new RegExp("^" + C + v + "[^aeiouwxy]$");

        if (re2.test(w)) { 
          w = w + "e"; 
          debugFunction('1b', re2, w);

        } else if (re3.test(w)) { 
          re = /.$/; 
          w = w.replace(re,""); 
          debugFunction('1b', re3, w);

        } else if (re4.test(w)) { 
          w = w + "e"; 
          debugFunction('1b', re4, w);
        }
      }
    }

    // Step 1c
    re = new RegExp("^(.*" + v + ".*)y$");
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      w = stem + "i";
      debugFunction('1c', re, w);
    }

    // Step 2
    re = /^(.+?)(ational|tional|enci|anci|izer|bli|alli|entli|eli|ousli|ization|ation|ator|alism|iveness|fulness|ousness|aliti|iviti|biliti|logi)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step2list[suffix];
        debugFunction('2', re, w);
      }
    }

    // Step 3
    re = /^(.+?)(icate|ative|alize|iciti|ical|ful|ness)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      suffix = fp[2];
      re = new RegExp(mgr0);
      if (re.test(stem)) {
        w = stem + step3list[suffix];
        debugFunction('3', re, w);
      }
    }

    // Step 4
    re = /^(.+?)(al|ance|ence|er|ic|able|ible|ant|ement|ment|ent|ou|ism|ate|iti|ous|ive|ize)$/;
    re2 = /^(.+?)(s|t)(ion)$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      if (re.test(stem)) {
        w = stem;
        debugFunction('4', re, w);
      }
    } else if (re2.test(w)) {
      var fp = re2.exec(w);
      stem = fp[1] + fp[2];
      re2 = new RegExp(mgr1);
      if (re2.test(stem)) {
        w = stem;
        debugFunction('4', re2, w);
      }
    }

    // Step 5
    re = /^(.+?)e$/;
    if (re.test(w)) {
      var fp = re.exec(w);
      stem = fp[1];
      re = new RegExp(mgr1);
      re2 = new RegExp(meq1);
      re3 = new RegExp("^" + C + v + "[^aeiouwxy]$");
      if (re.test(stem) || (re2.test(stem) && !(re3.test(stem)))) {
        w = stem;
        debugFunction('5', re, re2, re3, w);
      }
    }

    re = /ll$/;
    re2 = new RegExp(mgr1);
    if (re.test(w) && re2.test(w)) {
      re = /.$/;
      w = w.replace(re,"");
      debugFunction('5', re, re2, w);
    }

    // and turn initial Y back to y
    if (firstch == "y") {
      w = firstch.toLowerCase() + w.substr(1);
    }


    return w;
  }
})();
//end porter

function tokenizeString(inputString) {
  // Using regular expression to split the string by non-word characters and digits
  // This will tokenize the string based on spaces, punctuation, etc., while excluding numbers
  return inputString.split(/\W+|\d+/).filter(Boolean);
}

firebaseConfig = {
  databaseURL: "https://search-engine-568ee-default-rtdb.europe-west1.firebasedatabase.app/",
};

document.addEventListener("DOMContentLoaded", function() {
    firebase.initializeApp(firebaseConfig);
    homepageView();
  });

  function homepageView(){
    document.getElementById("content").innerHTML = homepage;
    // Load recent searches from localStorage
    let recentSearches = JSON.parse(localStorage.getItem("recentSearches")) || [];
    document.getElementById("admin").addEventListener('click', function(event){adminView();})
    // Update recent searches section
    updateRecentSearches(recentSearches);
     
    document.querySelector('.popular-searches .popular-links').addEventListener('click', function(event) {
      // Check if the clicked element is an anchor tag
      if (event.target.tagName === 'A') {
        // Prevent the default link behavior
        event.preventDefault();
        // Call the search function with appropriate parameters
        search(1, event.target.innerText);
      }
    });
    document.getElementById("searchButton").addEventListener("click", search);
    document.getElementById("searchInput").addEventListener("keypress", function(event) {
      if (event.key === "Enter") {
        search();
      }
    });
  }
  
  async function search(type = 0, text = "") {
    // Get the search query
    var searchQuery = document.getElementById("searchInput").value;
    if (type === 1) {
        searchQuery = text;
    }

    // Clear the content of the content div
    document.getElementById("content").innerHTML = "";
    let data = await fetchIndexData();
    terms = Object.entries(data).map(([key, value]) => ({ key, value }));

    let tokenizedQuery = tokenizeString(searchQuery.toLowerCase());
    if (tokenizedQuery.length != 0) {
        // Save the search query in recent searches
        saveRecentSearch(searchQuery);
    }
    let stemmedQuery = tokenizedQuery.map((word) => stemmer(word));
    const links = await fetchAndMergePages(stemmedQuery);

    // Create HTML for displaying search results
    var resultsHtml = `<div class="searchResultContainer"><h2>Search Results</h2><div class="scrollable"><div id="searchResults"></div></div></div>`;

    // Display search results in the content div
    document.getElementById("content").innerHTML = searchDiv + resultsHtml;
    createSearchResultElements(links);


    // Add event listeners for search button and Enter key press
    document.getElementById("searchButton").addEventListener("click", search);
    document.getElementById("searchInput").addEventListener("keypress", function(event) {
        if (event.key === "Enter") {
            search();
        }
    });

    // Set the search input value
    document.getElementById("searchInput").value = searchQuery;
}


  // Function to dynamically create search result elements
function createSearchResultElements(results) {
  // Get the search results container
  const searchResultsContainer = document.getElementById('searchResults');

  // Clear previous search results
  searchResultsContainer.innerHTML = '';

  // Create and append search result elements
  results.forEach(result => {
    const resultElement = document.createElement('div');
    resultElement.className = "searchResultDiv";
    const titleElement = document.createElement('a');
    titleElement.classList.add("title");
    titleElement.href = result.value.link; // Set the URL of the search result
    titleElement.textContent = result.value.title; // Set the title of the search result
    titleElement.target="_blank";
    resultElement.appendChild(titleElement); // Append the title to the result element

    const descriptionElement = document.createElement('p');
    descriptionElement.textContent = result.value.description; // Set the description of the search result
    descriptionElement.classList.add("description");

    resultElement.appendChild(descriptionElement); // Append the description to the result element

    searchResultsContainer.appendChild(resultElement); // Append the result element to the container
  });
}

  
  function saveRecentSearch(searchQuery) {
    let recentSearches = getRecentSearches();
  
    // Add the new search query to the recent searches
    recentSearches.unshift(searchQuery);
  
    // Ensure only 5 recent searches are stored
    if (recentSearches.length > 5) {
      recentSearches.pop();
    }
  
    // Save recent searches to localStorage
    localStorage.setItem("recentSearches", JSON.stringify(recentSearches));
  }
  
  function getRecentSearches() {
    return JSON.parse(localStorage.getItem("recentSearches")) || [];
  }
  
  function updateRecentSearches(recentSearches) {
    let recentSearchesContainer = document.querySelector(".rect-searches .popular-links");
    recentSearchesContainer.innerHTML = "";
    let id=1;
    recentSearches.forEach(function(searchQuery) {
      let link = document.createElement("a");
      link.id=id;
      id++;
      link.href = "#";
      link.textContent = searchQuery;
      link.addEventListener("click", function(event){search(1,searchQuery)});
      recentSearchesContainer.appendChild(link);
    });
  }

  function backToHomepage(){
    homepageView();
  }





var buttonsPerPage = 12;
var currentPage = 1;
var totalButtons = 50; // Total number of buttons

let terms;
let currentTerm;
async function adminView(){
  currentPage = 1;
  var adminContainer = document.getElementById('content');
  adminContainer.innerHTML = `
  <div class="container">
    <div class="div1">
          <div  id="terms"></div>
    
                  <div id="navigationButtons">
                  <button id="prev" onclick="prevPage()">prev</button>
                  <button id="next" onclick="nextPage()">next</button>
              </div>
    </div>

            <div class="div2" id="links"></div>
  </div>
   `;
  let data= await fetchIndexData();
  terms = Object.entries(data).map(([key, value]) => ({ key, value }));
  totalButtons=terms.length;
  console.log(terms);
  createButtons();

}

function fetchIndexData() {
  return new Promise((resolve, reject) => {
    const database = firebase.database().ref("/index");
  
    database.once('value')
      .then(snapshot => {
        const data = snapshot.val();
        resolve(data); // Resolve the promise with data
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        reject(error); // Reject the promise with error
      });
  });
}


async function fetchAndMergePages(stemmedQuery) {
  const uniquePages = new Set();

  // Iterate over each word in the stemmed query
  for (const word of stemmedQuery) {
      // Fetch pages for the current word
      const pages = await fetchTermPages(word);
      let pagesArray=Object.entries(pages).map(([key, value]) => ({ key, value }))
      console.log(pagesArray);
      // Merge the fetched pages with the uniquePages Set
      pagesArray.forEach(page => uniquePages.add(page));
  }

  // Convert the Set back to an array
  const mergedPages = Array.from(uniquePages);
  const uniqueArray = Array.from(new Set(mergedPages.map(obj => obj.key)))
  .map(key => mergedPages.find(obj => obj.key === key));
 
  return uniqueArray;
}





function fetchTermPages(term) {
  let termLinks=[];
  for (var i = 0; i < terms.length; i++) {
    if (terms[i].value.term == term) {
      termLinks = terms[i].value.DocIDs;
      break; // Exit loop once termLinks are found
    }
  }

  return new Promise((resolve, reject) => {
    const database = firebase.database().ref("/pages");

    database.once('value')
      .then(snapshot => {
        const data = snapshot.val();
        // Filter data based on termLinks
        const filteredPages = {};
        termLinks.forEach(docID => {
          if (data.hasOwnProperty(docID)) {
            filteredPages[docID] = data[docID];
          }
        });
        resolve(filteredPages); // Resolve the promise with filteredPages
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        reject(error); // Reject the promise with error
      });
  });
}


function createButtons() {
    var buttonContainer = document.getElementById('terms');
    buttonContainer.innerHTML = '';
    var startIndex = (currentPage - 1) * buttonsPerPage;
    var endIndex = Math.min(startIndex + buttonsPerPage, totalButtons);

    var container = document.createElement('div');
    container.className = 'buttonContainer';

    for (var i = startIndex; i < endIndex; i++) {
        var button = document.createElement('button');
        button.className = 'indexButton';
        let term=terms[i].value.term;
        button.innerText =  (term);
        button.addEventListener("click", function(event){displayLinks(term)});
        container.appendChild(button);
    }

    buttonContainer.appendChild(container);
  
}
function createLinksList(listItems, targetDivId) {
  // Create a new ul element
  var title = document.createElement('h2');
  title.textContent = currentTerm + ":";
  title.id = "termTitle";
  var ul = document.createElement('ul');

  var deleteTermbutton = document.createElement('button');
  deleteTermbutton.textContent = 'delete all';
  deleteTermbutton.id = 'delete all';
  deleteTermbutton.addEventListener('click', function(event) { deleteTerm(); });

  let id = 0;
  listItems.forEach(function(item) {
      var li = document.createElement('li');
      li.textContent = item.value.link;
      let linkID = "link " + id;
      li.id = linkID;
      var button = document.createElement('button');
      button.textContent = 'delete';
      button.addEventListener('click', function(event) { deleteLink(item.key, item.value.link, linkID); });
      li.appendChild(button);
      ul.appendChild(li);
      id++;
  });

  var targetDiv = document.getElementById(targetDivId);
  targetDiv.innerHTML = '';

  var scrollableDiv = document.createElement('div');
  scrollableDiv.className = 'scrollable'; // Add a class for styling

  scrollableDiv.appendChild(deleteTermbutton);
  scrollableDiv.appendChild(title);
  scrollableDiv.appendChild(ul);

  targetDiv.appendChild(scrollableDiv);
}


function deleteLink(id,link,linkID){
  const database = firebase.database();

  // Reference to the 'index' node in the database
  const indexRef = database.ref('/index');

  // Query the index node to find the entry with the specified term
  indexRef.orderByChild('term').equalTo(currentTerm).once('value', snapshot => {
    snapshot.forEach(childSnapshot => {
      const key = childSnapshot.key;
      const entry = childSnapshot.val();

      // Check if the entry has the specified docId in its DocIDs array
      if (entry.DocIDs && entry.DocIDs.includes(id)) {
        // Remove the id from the DocIDs array
        const updatedDocIDs = entry.DocIDs.filter(docId => docId !== id);
        
        // Update the entry in the database
        indexRef.child(key).update({ DocIDs: updatedDocIDs })
          .then(() => {
            console.log(`Removed docId ${id} from term ${currentTerm}`);
            let linkElement= document.getElementById(linkID);
            linkElement.remove();
            let termLinks;
            for (var i = 0; i < terms.length; i++) {
              if (terms[i].value.term == currentTerm) {
                terms[i].value.DocIDs=updatedDocIDs;
                if(updatedDocIDs.length===0){
                  terms.splice(i, 1); // Remove the term at index i
                  totalButtons=terms.length;
                }
                break; // Exit loop once termLinks are found
              }
            }  
            if (updatedDocIDs.length === 0) {
              removeEntryFromIndex(key);//remove term from db
              var totalPages = Math.ceil(totalButtons / buttonsPerPage);
              if (currentPage > totalPages) {
                  currentPage--;
              }
              document.getElementById("termTitle").remove();//remove title of the term
              document.getElementById("delete all").remove();//remove button of the term
              createButtons();//update display
            }
          })
          .catch(error => {
            console.error('Error removing docId:', error);
          });
      } else {
        console.log(`DocId ${id} not found in term ${currentTerm}`);
      }
    });
  })
  .catch(error => {
    console.error('Error fetching data:', error);
  });
}

function deleteTerm(){
  for (var i = 0; i < terms.length; i++) {
    if (terms[i].value.term == currentTerm) {
        removeEntryFromIndex(terms[i].key);//remove term from db
        terms.splice(i, 1); // Remove the term at index i
        totalButtons=terms.length;
      break; // Exit loop once termLinks are found
    }
  }  
    var totalPages = Math.ceil(totalButtons / buttonsPerPage);
    if (currentPage > totalPages) {
        currentPage--;
    }
    var targetDiv = document.getElementById("links");
    // Clear the target div before loading the list
    targetDiv.innerHTML = '';
    createButtons();//update display
}

function removeEntryFromIndex(key) {
  const database = firebase.database();
  const indexRef = database.ref('/index');

  // Remove the entry with the specified key
  indexRef.child(key).remove()
    .then(() => {
      console.log(`Entry with key ${key} removed from index.`);
    })
    .catch(error => {
      console.error('Error removing entry from index:', error);
    });
}

async function displayLinks(term){
  currentTerm=term;
  let data= await fetchTermPages(term);
  let links=Object.entries(data).map(([key, value]) => ({ key, value }));
  createLinksList(links,"links");
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        createButtons();
    }
    else{
      alert("you're in the first page");
    }
}

function nextPage() {
    var totalPages = Math.ceil(totalButtons / buttonsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        createButtons();
    }
	  else{
      alert("you're in the last page");
    }
}

const searchData = {
  searchesByWord: {
    SAAS: 100,
    IAAS: 150,
    PAAS: 120,
    PublicCloud: 80,
    PrivateCloud: 90
  },
  searchesByUser: {
    User1: 50,
    User2: 70,
    User3: 30,
    User4: 90,
    User5: 110
  },
  commonWords: {
    "Cloud": 300,
    "Service": 250,
    "Data": 200,
    "Security": 180,
    "Platform": 150
  },
  wordFrequency: [
    { word: "Cloud", frequency: 300 },
    { word: "Service", frequency: 250 },
    { word: "Data", frequency: 200 },
    { word: "Security", frequency: 180 },
    { word: "Platform", frequency: 150 }
  ]
};

// Function to convert object to array for chart data
function objectToArray(obj) {
  return Object.keys(obj).map(key => ({ label: key, value: obj[key] }));
}

// Function to get data for word frequency chart
function getWordFrequencyChartData(data) {
  return data.map(item => item.frequency);
}

// Function to create charts
function createCharts() {
  // Chart configuration
  const config = {
    type: 'bar',
    data: {
      labels: objectToArray(searchData.searchesByWord).map(item => item.label),
      datasets: [{
        label: 'Number of Searches',
        data: objectToArray(searchData.searchesByWord).map(item => item.value),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  // Create Charts
  var searchesByWordCtx = document.getElementById('searchesByWordChart').getContext('2d');
  new Chart(searchesByWordCtx, config);

  // Searches By User
  const searchesByUserConfig = {
    type: 'pie',
    data: {
      labels: objectToArray(searchData.searchesByUser).map(item => item.label),
      datasets: [{
        label: 'Number of Searches',
        data: objectToArray(searchData.searchesByUser).map(item => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  var searchesByUserCtx = document.getElementById('searchesByUserChart').getContext('2d');
  new Chart(searchesByUserCtx, searchesByUserConfig);

  // Common Words
  const commonWordsConfig = {
    type: 'doughnut',
    data: {
      labels: objectToArray(searchData.commonWords).map(item => item.label),
      datasets: [{
        label: 'Word Frequency',
        data: objectToArray(searchData.commonWords).map(item => item.value),
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)',
          'rgba(153, 102, 255, 0.2)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
        ],
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  var commonWordsCtx = document.getElementById('commonWordsChart').getContext('2d');
  new Chart(commonWordsCtx, commonWordsConfig);

  // Word Frequency
  const wordFrequencyConfig = {
    type: 'bar',
    data: {
      labels: searchData.wordFrequency.map(item => item.word),
      datasets: [{
        label: 'Word Frequency',
        data: getWordFrequencyChartData(searchData.wordFrequency),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        y: {
          beginAtZero: true
        }
      }
    }
  };

  var wordFrequencyCtx = document.getElementById('wordFrequencyChart').getContext('2d');
  new Chart(wordFrequencyCtx, wordFrequencyConfig);
}


function goToStatsPage() {
  document.getElementById("content").innerHTML=statsScreen;
  createCharts();
}




