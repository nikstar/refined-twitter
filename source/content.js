import domLoaded from 'dom-loaded';
import {observeEl, safeElementReady, safely} from './libs/utils';
import autoLoadNewTweets from './features/auto-load-new-tweets';
import inlineInstagramPhotos from './features/inline-instagram-photos';
import userChoiceColor from './features/user-choice-color';
import codeHighlight from './features/code-highlight';
import mentionHighlight from './features/mentions-highlight';
import addLikesButtonNavBar from './features/likes-button-navbar';
import keyboardShortcuts from './features/keyboard-shortcuts';
import renderInlineCode from './features/inline-code';
import disableCustomColors from './features/disable-custom-colors';
import imageAlternatives from './features/image-alternatives';

function cleanNavbarDropdown() {
	$('#user-dropdown').find('[data-nav="all_moments"], [data-nav="ads"], [data-nav="promote-mode"], [data-nav="help_center"]').parent().hide();
}

function hideLikeTweets() {
	$('.tweet-context .Icon--heartBadge').parents('.js-stream-item').hide();
}

function hidePromotedTweets() {
	$('.promoted-tweet').parent().remove();
}

async function init() {
	await safeElementReady('body');

	if (document.body.classList.contains('logged-out')) {
		return;
	}

	document.documentElement.classList.add('refined-twitter');

	safely(addLikesButtonNavBar);

	await domLoaded;
	onDomReady();
}

function onRouteChange(cb) {
	observeEl('#doc', cb, {attributes: true});
}

function onNewTweets(cb) {
	observeEl('#stream-items-id', cb);
}

function onSingleTweetOpen(cb) {
	observeEl('body', mutations => {
		for (const mutation of mutations) {
			const {classList} = mutation.target;
			if (classList.contains('overlay-enabled')) {
				observeEl('#permalink-overlay', cb, {attributes: true, subtree: true});
				break;
			} else if (classList.contains('modal-enabled')) {
				observeEl('#global-tweet-dialog', cb, {attributes: true, subtree: true});
				break;
			}
		}
	}, {attributes: true});
}

function onGalleryItemOpen(cb) {
	observeEl('body', mutations => {
		for (const mutation of mutations) {
			if (mutation.target.classList.contains('gallery-enabled')) {
				observeEl('.Gallery-media', cb, {attributes: true, subtree: true});
				break;
			}
		}
	}, {attributes: true});
}

function removeProfileHeader() {
	$('.ProfileCanopy-header .ProfileCanopy-avatar').appendTo('.ProfileCanopy-inner .AppContainer');
	$('.ProfileCanopy-header').remove();
}

function onDomReady() {
	safely(cleanNavbarDropdown);
	safely(keyboardShortcuts);

	onRouteChange(() => {
		safely(autoLoadNewTweets);
		safely(userChoiceColor);
		safely(disableCustomColors);
		safely(removeProfileHeader);

		onNewTweets(() => {
			safely(codeHighlight);
			safely(mentionHighlight);
			safely(inlineInstagramPhotos);
			safely(hidePromotedTweets);
			safely(renderInlineCode);
			safely(imageAlternatives);
		});
	});

	onSingleTweetOpen(() => {
		safely(codeHighlight);
		safely(mentionHighlight);
		safely(inlineInstagramPhotos);
		safely(renderInlineCode);
		safely(imageAlternatives);
	});

	onGalleryItemOpen(() => {
		safely(imageAlternatives);
	});
}

init();
