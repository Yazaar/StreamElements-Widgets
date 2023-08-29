var title = document.querySelector('#title');
var detail = document.querySelector('#detail');
var iconWrapper = document.querySelector('#iconWrapper');

var currencySymbol;

var latest = {
    host: {
        title: 'recent raid',
        detail: 'no data',
        icon: 'share-alt'
    },
    follower: {
        title: 'recent follower',
        detail: 'no data',
        icon: 'heart'
    },
    subscriber: {
        title: 'recent subscriber',
        detail: 'no data',
        icon: 'star'
    },
    cheer: {
        title: 'recent cheer',
        detail: 'no data',
        icon: 'gem'
    },
    tip: {
        title: 'recent tip',
        detail: 'no data',
        icon: 'dollar-sign'
    }
};

var order = [];

var currentIndex = -1;
var fadingOut = true;

var shownDuration;
var hiddenDuration;
var fadeInAnimation;
var fadeOutAnimation;

var hostName = 'no data';
var hostCount = 0;
var hostTimestamp = new Date();

var wrapper = document.querySelector('#wrapper');

window.addEventListener('onEventReceived', function (obj) {
    var e = obj.detail;
    if (!e.event || e.event.isTest === true) {
        return;
    }

    if (e.listener === 'follower-latest') {
        latest.follower.detail = e.event.name;
    } else if (e.listener === 'subscriber-latest') {
        latest.subscriber.detail = e.event.name + ': x' + e.event.amount;
    } else if (e.listener === 'cheer-latest') {
        latest.cheer.detail = e.event.name + ': ' + e.event.amount;
    } else if (e.listener === 'tip-latest') {
        latest.cheer.detail = e.event.name + ': ' + e.event.amount;
    } else if (e.listener === 'raid-latest' || e.listener === 'host-latest') {
        var currentTime = new Date();
        if (hostUser !== e.event.name || currentTime - hostTimestamp > 10000) {
            hostUser = e.event.name;
            hostCount = e.event.amount;
            hostTimestamp = currentTime;
            latest.host.detail = hostUser + ': ' + hostCount;
        } else if (hostCount < e.event.amount) {
            hostCount = e.event.amount;
            hostTimestamp = currentTime;
            latest.host.detail = hostUser + ': ' + hostCount;
        }
    }
});

window.addEventListener('onWidgetLoad', function (obj) {
    currencySymbol = obj.detail.currency.symbol;
  
    if (obj.detail.fieldData.showFollowers === 'yes'){
        order.push('follower');
    }
  	if (obj.detail.fieldData.showSubscriptions === 'yes'){
        order.push('subscriber');
    }
    if (obj.detail.fieldData.showDonations === 'yes'){
        order.push('tip');
    }
    if (obj.detail.fieldData.showBits === 'yes'){
        order.push('cheer');
    }
    if (obj.detail.fieldData.showHosts === 'yes'){
        order.push('host');
    }
  
    shownDuration = obj.detail.fieldData.shownDuration;
    hiddenDuration = obj.detail.fieldData.hiddenDuration;
    fadeInAnimation = 'fadeIn ' + obj.detail.fieldData.fadeInDuration + 'ms linear forwards';
    fadeOutAnimation = 'fadeOut ' + obj.detail.fieldData.fadeOutDuration + 'ms linear forwards';

    if (obj.detail.session.data['follower-latest'].name !== '') {
        latest.follower.detail = obj.detail.session.data['follower-latest'].name;
    }

    if (obj.detail.session.data['subscriber-latest'].name !== '') {
        latest.subscriber.detail = obj.detail.session.data['subscriber-latest'].name + ': x' + obj.detail.session.data['subscriber-latest'].amount;
    }

    if (obj.detail.session.data['tip-latest'].name !== '') {
        latest.tip.detail = obj.detail.session.data['tip-latest'].name + ': ' + currencySymbol + obj.detail.session.data['tip-latest'].amount;
    }

    if (obj.detail.session.data['cheer-latest'].name !== '') {
        latest.cheer.detail = obj.detail.session.data['cheer-latest'].name + ': ' + obj.detail.session.data['cheer-latest'].amount;
    }

    if (obj.detail.session.data['raid-recent'].length === 0 && obj.detail.session.data['host-recent'].length === 0) {
        hideText();
        return;
    } else if (obj.detail.session.data['raid-recent'].length === 0) {
        var hostTime = new Date(obj.detail.session.data['host-recent'][0].createdAt);
        var timeDelta = 20000;
    } else {
        var hostTime = new Date(obj.detail.session.data['host-recent'][0].createdAt);
        var raidTime = new Date(obj.detail.session.data['raid-recent'][0].createdAt);
        var timeDelta = hostTime - raidTime;
        if (timeDelta < 0) {
            timeDelta = timeDelta * -1;
        }
    }
    if (obj.detail.session.data['raid-latest'].name === obj.detail.session.data['host-latest'].name &&
        timeDelta < 10000) {
        if (obj.detail.session.data['raid-latest'].amount > obj.detail.session.data['host-latest'].amount) {
            hostName = obj.detail.session.data['raid-latest'].name;
            hostCount = obj.detail.session.data['raid-latest'].amount;
            hostTimestamp = raidTime;
            latest.host.detail = hostName + ': ' + hostCount;
        } else {
            hostName = obj.detail.session.data['host-latest'].name;
            hostCount = obj.detail.session.data['host-latest'].amount;
            hostTimestamp = hostTime;
            latest.host.detail = hostName + ': ' + hostCount;
        }
    } else {
        if (obj.detail.session.data['host-latest'].name !== '') {
            hostName = obj.detail.session.data['host-latest'].name;
            hostCount = obj.detail.session.data['host-latest'].amount;
            hostTimestamp = new Date(obj.detail.session.data['host-recent'][0].createdAt);
            latest.host.detail = hostName + ': ' + hostCount;
        }
    }
    hideText();
});

function displayNext() {
    currentIndex = (currentIndex + 1) % order.length;
    title.innerText = latest[order[currentIndex]].title;
    detail.innerText = latest[order[currentIndex]].detail;

    iconWrapper.innerHTML = '';

    var icon = document.createElement('i');
    icon.classList.add('fas');
    icon.classList.add('fa-' + latest[order[currentIndex]].icon);
    iconWrapper.appendChild(icon);
	
    iconWrapper.style.animation = fadeInAnimation;
    title.style.animation = fadeInAnimation;
    detail.style.animation = fadeInAnimation;
}

function hideText() {
    iconWrapper.style.animation = fadeOutAnimation;
    title.style.animation = fadeOutAnimation;
    detail.style.animation = fadeOutAnimation;
}

function animationEnd() {
    if (fadingOut === true) {
        fadingOut = false;
        setTimeout(displayNext, hiddenDuration);
    } else {
        fadingOut = true;
        setTimeout(hideText, shownDuration);
    }
}

title.addEventListener('animationend', animationEnd);
