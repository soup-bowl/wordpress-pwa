import { Outlet, useNavigate, useParams } from "react-router-dom";
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import { CssBaseline, ThemeProvider, Toolbar, IconButton, Typography,
	Container, styled, Drawer, Divider, Box, List, ListItemIcon,
	ListItemText, useMediaQuery, ListItemButton} from '@mui/material';
import { useEffect, useState } from "react";
import { AxiosError } from "axios";
import theme from '../theme';
import agent from "../agent";
import { ISiteInformation } from "../interfaces";

import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import PushPinIcon from '@mui/icons-material/PushPin';
import DescriptionIcon from '@mui/icons-material/Description';
import CoPresentIcon from '@mui/icons-material/CoPresent';

const drawerWidth = 240;

interface AppBarProps extends MuiAppBarProps {
	open?: boolean;
}

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
	open?: boolean;
}>(({ theme, open }) => ({
	flexGrow: 1,
	padding: theme.spacing(3),
	transition: theme.transitions.create('margin', {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		transition: theme.transitions.create('margin', {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const AppBar = styled(MuiAppBar, {
	shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
	transition: theme.transitions.create(['margin', 'width'], {
		easing: theme.transitions.easing.sharp,
		duration: theme.transitions.duration.leavingScreen,
	}),
	...(open && {
		transition: theme.transitions.create(['margin', 'width'], {
			easing: theme.transitions.easing.easeOut,
			duration: theme.transitions.duration.enteringScreen,
		}),
	}),
}));

const DrawerHeader = styled('div')(({ theme }) => ({
	display: 'flex',
	alignItems: 'center',
	padding: theme.spacing(0, 1),
	// necessary for content to be below app bar
	...theme.mixins.toolbar,
	justifyContent: 'flex-end',
}));

export function Layout() {
	const navigate = useNavigate();
	const { inputURL } = useParams();
	const [open, setOpen] = useState(false);
	const desktop = useMediaQuery("(min-width: 961px)");
	const [mainInfo, setMainInfo] = useState<ISiteInformation>({} as ISiteInformation);
	const [apiError, setApiError] = useState<string>('');

	const handleDrawerOpen = () => {
		setOpen(true);
	};

	const handleDrawerClose = () => {
		setOpen(false);
	};

	useEffect(() => {
		agent.Info.full(`https://${inputURL}`)
        .then((response:any) => {
			//console.log('Info Reply', response);
			setApiError('');
			setMainInfo({
				name: response.name ?? 'N/A',
				url: response.url,
				hasPages: false,
				hasPosts: false
			});
        })
		.catch((err:AxiosError) => {
			setApiError(`[${err.code}] ${err.message}`);
			setMainInfo({} as ISiteInformation);
		});
    }, [inputURL]);

	return(
		<ThemeProvider theme={theme}>
			<Box sx={{ display: 'flex' }}>
				<CssBaseline />
				<AppBar
					position="fixed"
					open={open}
					sx={{zIndex: (theme) => ( desktop ? theme.zIndex.drawer + 1 : 0)}}>
					<Toolbar>
						{ ! desktop ?
						<IconButton
							color="inherit"
							aria-label="open drawer"
							onClick={handleDrawerOpen}
							edge="start"
							sx={{ mr: 2, ...(open && { display: 'none' }) }}
						>
							<MenuIcon />
						</IconButton>
						: null }
						<Typography variant="h6" noWrap component="div">{mainInfo.name}</Typography>
					</Toolbar>
				</AppBar>
				<Drawer
					sx={{
					width: drawerWidth,
					flexShrink: 0,
					'& .MuiDrawer-paper': {
						width: drawerWidth,
						boxSizing: 'border-box',
					},
					}}
					variant={(desktop) ? "permanent" : "temporary"}
					anchor="left"
					open={open}
					onClose={handleDrawerClose}
				>
					<DrawerHeader>
						<IconButton onClick={handleDrawerClose}>
							<MenuIcon />
						</IconButton>
					</DrawerHeader>
					<Divider />
					<List>
						<ListItemButton
							onClick={() => {navigate(`/${inputURL}`);handleDrawerClose();}}
							selected={(window.location.hash.replace(`/${inputURL}`, '') === "#")}
						>
							<ListItemIcon><HomeIcon /></ListItemIcon>
							<ListItemText primary="Home" />
						</ListItemButton>
					</List>
					<Divider />
					<List>
						<ListItemButton
							onClick={() => {navigate(`/${inputURL}/posts`);handleDrawerClose();}}
							selected={window.location.hash.includes("/posts")}
						>
							<ListItemIcon><PushPinIcon /></ListItemIcon>
							<ListItemText primary="Posts" />
						</ListItemButton>
						<ListItemButton
							onClick={() => {navigate(`/${inputURL}/pages`);handleDrawerClose();}}
							selected={window.location.hash.includes("/pages")}
						>
							<ListItemIcon><DescriptionIcon /></ListItemIcon>
							<ListItemText primary="Pages" />
						</ListItemButton>
					</List>
					<Divider />
					<List>
						<ListItemButton
							onClick={() => {navigate(`/${inputURL}/about`);handleDrawerClose();}}
							selected={window.location.hash.includes("/about")}
						>
							<ListItemIcon><CoPresentIcon /></ListItemIcon>
							<ListItemText primary="About" />
						</ListItemButton>
					</List>
				</Drawer>
				<Main open={open}>
					<DrawerHeader />
					<Container maxWidth="md">
						{apiError === '' ?
						<Outlet context={[mainInfo]}  />
						:
						<>
							<Typography variant="h1">Unable to Display Website</Typography>
							<Typography my={2}>
								We've made a request to the website's JSON API (if it exists), and have not had the
								expected response returned.
							</Typography>
							<Typography my={2}>
								This can be due to the following reasons:
							</Typography>
							<ul>
								<li>The website you requested is not a WordPress site.</li>
								<li>The website has blocked or disabled their REST API endpoint(s).</li>
								<li>The API is behind a strict CORS policy disabling us from seeing it.</li>
							</ul>
							<Typography variant="h5" component="h2">Technical Details</Typography>
							<Typography my={2} sx={{fontFamily: 'monospace'}}>{apiError}</Typography>
						</>
						}
					</Container>
				</Main>
			</Box>
		</ThemeProvider>
	);
}

export function LayoutLight() {
	return(
		<ThemeProvider theme={theme}>
			<Box sx={{ display: 'flex' }}>
				<CssBaseline />
				<Container maxWidth="md">
					<Outlet />
				</Container>
			</Box>
		</ThemeProvider>
	);
}