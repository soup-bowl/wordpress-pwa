import { Button, TextField, Typography, Box, Grid, Link, CircularProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router-dom';
import { IPost, ISiteInfo } from '../interfaces';

import GitHubIcon from '@mui/icons-material/GitHub';
import { CardDisplay } from '../components/cards';
import WPAPI from 'wpapi';
import { GeneralAPIError } from '../components/error';

export function MainHome() {
	const [inputURL, setInputURL] = useState('');
	const navigate = useNavigate();

	const submitForm = (e:any) => {
		e.preventDefault();
		return navigate('/' + inputURL);
	};

	const changeForm = (e:any) => {
		setInputURL(e.target.value);
	};

	useEffect(() => {
		document.title = `Choose a site - Wapp`;
	}, []);

	return(
		<Grid
			container
			spacing={0}
			direction="column"
			alignItems="center"
			justifyContent="center"
			style={{ minHeight: '50vh' }}
		>
			<Grid item xs={3} textAlign="center">
				<Typography variant="h1">WordPress App Generator</Typography>
				<Typography my={2}>
					If the URL you specify is a WordPress site with an exposed&nbsp;
					<Link href="https://developer.wordpress.org/rest-api/">WordPress REST API</Link>, we can generate a
					basic web application from the API contents.
				</Typography>
				<form onSubmit={submitForm} noValidate>
					<TextField fullWidth
						id="url"
						type="url"
						label="URL"
						variant="outlined"
						onChange={changeForm}
					/>
					<Box my={2}>
						<Button type="submit" variant="contained">Appify!</Button>
					</Box>
				</form>
				<Typography my={2}>
					🧪 A <Link href="https://soupbowl.io">Soupbowl</Link> experiment&nbsp;
					<GitHubIcon fontSize='inherit' /> <Link href="https://github.com/soup-bowl/project-wordpress-pwa">
					source code</Link>
				</Typography>
			</Grid>
		</Grid>
	);
}

export function AppHome() {
	const [mainInfo] = useOutletContext<[ISiteInfo]>();
	const { inputURL } = useParams();
	const [apiError, setApiError] = useState<string>('');
	const [loadingContent, setLoadingContent] = useState<boolean>(true);
	const [postCollection, setPostCollection] = useState<IPost[]>([]);
	const [pageCollection, setPageCollection] = useState<IPost[]>([]);
	const wp = new WPAPI({ endpoint: `https://${inputURL}/wp-json` });

	useEffect(() => {
		Promise.all([
			wp.posts().perPage(3).embed().get(),
			wp.pages().perPage(3).embed().get(),
		]).then(values => {
			delete values[0]['_paging'];
			delete values[1]['_paging'];
			setPostCollection(values[0]);
			setPageCollection(values[1]);
			setLoadingContent(false);
		}).catch((err) => {
			setApiError(`[${err.code}] ${err.message}`);
			setLoadingContent(false);
		});
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [inputURL]);

	useEffect(() => { document.title = `${mainInfo.name ?? 'Error'} - Wapp` }, [mainInfo]);

	return(
		<Box>
			<Typography variant="h1">{mainInfo.name}</Typography>
			<Typography my={2}>{mainInfo.description}</Typography>
			{!loadingContent ?
				<>
				{apiError === '' ?
					<>
					{postCollection.length > 0 ?
						<>
						<Typography variant="h2">Posts</Typography>
						<CardDisplay posts={postCollection} />
						</>
						: null}

					{pageCollection.length > 0 ?
						<>
						<Typography variant="h2">Pages</Typography>
						<CardDisplay posts={pageCollection} />
						</>
						: null}
					</>
				:
					<GeneralAPIError endpoint="Posts/Pages" message={apiError} noheader />
				}
				</>
			:
				<CircularProgress />
			}
		</Box>
	);
}
