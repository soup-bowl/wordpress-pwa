import { Box, Typography } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import { CardDisplay, CardLoad, GeneralAPIError } from "../components";
import { IPost, ISiteInfo, ITag, IWPAPIError, IWPIndexing } from "../interfaces";
import { WordPressContext } from "./_layout";

const displayedLimit: number = 12;

interface PostProps {
	posts?: boolean;
	pages?: boolean;
	categories?: boolean;
	tax?: boolean;
}

export const PostListings = ({ posts = false, pages = false, categories = false, tax = false }: PostProps) => {
	const [mainInfo] = useOutletContext<[ISiteInfo]>();
	const { inputURL, searchID, pageID } = useParams();
	const [loadingContent, setLoadingContent] = useState<boolean>(true);
	const [iterDef, setIterDef] = useState<string>();
	const [postCollection, setPostCollection] = useState<IPost[]>([]);
	const [paging, setPaging] = useState<IWPIndexing>({} as IWPIndexing);
	const [pagingURL, setPagingURL] = useState<string>('');
	const [apiError, setApiError] = useState<string>('');
	const wp = useContext(WordPressContext);

	const CommonInterface = {
		posts: () => wp.posts().perPage(displayedLimit).page(parseInt(pageID ?? '1')).embed().get(),
		postsByCategory: (cat: number) => wp.posts().categories(cat).perPage(displayedLimit).page(parseInt(pageID ?? '1')).embed().get(),
		postsByTag: (cat: number) => wp.posts().tags(cat).perPage(displayedLimit).page(parseInt(pageID ?? '1')).embed().get(),
		pages: () => wp.pages().perPage(displayedLimit).page(parseInt(pageID ?? '1')).embed().get(),
		pagesByCategory: (cat: number) => wp.pages().categories(cat).perPage(displayedLimit).page(parseInt(pageID ?? '1')).embed().get(),
		pagesByTag: (cat: number) => wp.pages().tags(cat).perPage(displayedLimit).page(parseInt(pageID ?? '1')).embed().get(),
	}

	const saveResponse = (posts: any) => {
		setPaging(posts._paging);
		delete posts['_paging'];
		setPostCollection(posts);
		setLoadingContent(false);
	}

	const errResponse = (err: IWPAPIError) => {
		setApiError(`[${err.code}] ${err.message}`);
		setLoadingContent(false);
	}

	useEffect(() => {
		setLoadingContent(true);

		if (posts) {
			setIterDef('Posts');
			if (categories) {
				setPagingURL(`/${inputURL}/posts/category/${searchID}`);
				CommonInterface.postsByCategory(parseInt(searchID ?? '0'))
					.then((posts: any) => saveResponse(posts))
					.catch((err: IWPAPIError) => errResponse(err));
			} else if (tax) {
				setPagingURL(`/${inputURL}/posts/tag/${searchID}`);
				CommonInterface.postsByTag(parseInt(searchID ?? '0'))
					.then((posts: any) => saveResponse(posts))
					.catch((err: IWPAPIError) => errResponse(err));
			} else {
				setPagingURL(`/${inputURL}/posts`);
				CommonInterface.posts()
					.then((posts: any) => saveResponse(posts))
					.catch((err: IWPAPIError) => errResponse(err));
			}
		}

		if (pages) {
			setIterDef('Pages');
			if (categories) {
				setPagingURL(`/${inputURL}/pages/category/${searchID}`);
				CommonInterface.pagesByCategory(parseInt(searchID ?? '0'))
					.then((posts: any) => saveResponse(posts))
					.catch((err: IWPAPIError) => errResponse(err));
			} else if (tax) {
				setPagingURL(`/${inputURL}/pages/tag/${searchID}`);
				CommonInterface.pagesByTag(parseInt(searchID ?? '0'))
					.then((posts: any) => saveResponse(posts))
					.catch((err: IWPAPIError) => errResponse(err));
			} else {
				setPagingURL(`/${inputURL}/pages`);
				CommonInterface.pages()
					.then((posts: any) => saveResponse(posts))
					.catch((err: IWPAPIError) => errResponse(err));
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchID, pageID, categories, tax, posts, pages]);

	useEffect(() => {
		if (categories && searchID !== undefined) {
			wp.categories().id(parseInt(searchID)).get()
				.then((catdef: ITag) => setIterDef(catdef.name ?? iterDef));
		}

		if (tax && searchID !== undefined) {
			wp.tags().id(parseInt(searchID)).get()
				.then((catdef: ITag) => setIterDef(catdef.name ?? iterDef));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchID, iterDef, postCollection, categories, tax]);

	useEffect(() => {
		document.title = `${mainInfo.name ?? 'Error'} ${posts ? 'Posts' : 'Pages'} - Pressify`;
	}, [mainInfo, posts]);

	if (apiError !== '') {
		return (<GeneralAPIError endpoint={posts ? 'Posts' : 'Pages'} message={apiError} />);
	}

	return (
		<Box>
			<Typography variant="h1">{iterDef}</Typography>
			{!loadingContent ?
				<CardDisplay posts={postCollection} page={parseInt(pageID ?? '1')} pagination={paging} returnURI={pagingURL} />
				:
				<CardLoad amount={displayedLimit} />
			}
		</Box>
	);
}
