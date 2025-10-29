import { Button, Checkbox, Grid, TextField, Typography } from "@mui/material";

function Login() {
    return (
        <Grid container spacing={2} sx={{ backgroundColor: 'white' }}>
            <Grid size={{ xs: 12, lg: 6 }} sx={{ paddingX: { xs: '20px', lg: 20 }, paddingY: { xs: 10, lg: 10 }, lineHeight: '30px' }}>
                <div className="flex justify-center">
                    <img src={"/logo.jpg"} width={'200px'} height={'100px'} />
                </div>

                <Typography variant="h4" color="primary">Welcome Back</Typography>
                <Typography variant="body2" color="primary">Sign in to continue</Typography>
                <br />
                <TextField variant="outlined" label="Email" sx={{ width: '100%' }}></TextField>
                <br /><br />
                <TextField variant="outlined" type="password" label="Password" sx={{ width: '100%' }}></TextField>
                <Grid container spacing={2}>
                    <Grid size={6} sx={{ flexDirection: 'row' }}>
                        <Checkbox></Checkbox>
                        <Typography variant="caption">Remember me</Typography>
                    </Grid>
                    <Grid size={6} textAlign={"right"} sx={{ paddingY: '3px' }}>
                        <Typography variant="caption">Forgot Password?</Typography>
                    </Grid>
                </Grid>
                <br />
                <Button variant="contained" color="primary">Sign In</Button>
            </Grid>
            <Grid size={{ xs: 12, lg: 6 }}>
                <Grid sx={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '10px', height: '100vh', paddingX: { xs: 3, lg: 15 }, backgroundColor: '#A22C29' }}>
                    <div className="py-20 justify-center flex">
                        <Typography variant="h5" color="secondary">Effortlessly manage your orders and operations</Typography>
                    </div>
                    <div className="justify-center flex">
                        <Typography variant="body1" color="secondary">Login to access CRM and manage stocks, sales and customers</Typography>
                    </div>
                    <div className="justify-center flex">
                        <img src={"https://joblly-admin-template-dashboard.multipurposethemes.com/intro/images/main.png"} width="100%" />
                    </div>
                </Grid>

            </Grid>
        </Grid>
    )

}

export default Login;