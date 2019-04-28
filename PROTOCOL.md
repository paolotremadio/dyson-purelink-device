
Field | Description | States | Notes
-- | -- | -- | --
fpwr | Power | ON, OFF | Turns Fan On/Off
fdir | Front direction | ON, OFF | Switches between   blowing from the front and the back of the fan
auto | Auto mode | ON, OFF | Enables/Disables   Auto mode
oscs | Oscillation status | ON, OFF, IDLE | Oscillation goes   to idle when auto mode is on and target air quality is reached
oson | Oscillation | ON, OFF | Turns the   ossicallation on and off
nmod | Night Mode | ON, OFF | Enables night   mdode
rhtm | Continuous   Monitoring | ON, OFF | Switches   continious monitoring onn and off
fnst | Fan state | FAN, OFF | Have to check if   there aren't other states
ercd | unknown |   | Those two are   ignored in the previous fans too, looks like some sort of condition or state
wacd | unknown |   |  
nmdv | Night Mode Fan   Speed | 1-10? | Shows 4 right now
fnsp | Fan speed | AUTO, 1-10 | Controls the fan   speed
bril | unknown | 2? | No idea what this   is, but its always 2
corf | unknown | ON? | No idea what this   is either but it is always on
cflr | Carbon filter   status | 1 - 100 | Carbon filter   status in percentage
hflr | HEPA filter status | 1 - 100 | HEPA filter status   in percentage
sltm | Sleep timer | OFF, 1-540? | Integer   representing minutes, maximum number in android app is 540
osal | Oscillation lower   angle | 5 - 355 | Configures the   lower angle of the arc of oscillation
osau | Oscillation upper   angle | 5 - 355 | Configures the   upper angle of the arc of oscillation. Can't be lower than the lower one.   If  both are set to the same value   oscillation is disabled and it configures the angle of the fan
ancp | Unknown | CUST | No idea, it is   always set to cust


Full details: https://github.com/CharlesBlonde/libpurecoollink/issues/14#issuecomment-395401783
