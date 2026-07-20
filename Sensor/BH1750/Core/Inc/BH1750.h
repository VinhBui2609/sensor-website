#ifndef BH1750_H_
#define BH1750_H_

#include <stdint.h>

/* Macro Command */
// Slave address
#define ADDR_HIGH_ADDRESS_WRITE 	(0xB8 + 0)
#define ADDR_HIGH_ADDRESS_READ 		(0xB8 + 1)
#define ADDR_LOW_ADDRESS_WRITE		(0x46 + 0)
#define ADDR_LOW_ADDRESS_READ 		(0x46 + 1)


// Commands table
#define BH1750_POWER_DOWN			0x00
#define BH1750_POWER_ON				0x01
#define BH1750_RESET				0x07
#define BH1750_CON_H_RES_MODE		0x10
#define BH1750_CON_H_RES_MODE2		0x11
#define BH1750_CON_L_RES_MODE		0x13
#define BH1750_ONE_H_RES_MODE		0x20
#define BH1750_ONE_H_RES_MODE2		0x21
#define BH1750_ONE_L_RES_MODE		0x23
#define BH1750_CHANGE_HIGH_MT		0x08	//01000_XXX
#define BH1750_CHANGE_LOW_MT		0x03	//011_XXXXX

// Sending data
#define POW_2_OF_15 	32768
#define POW_2_OF_9 		512
#define POW_2_OF_8		256
#define POW_2_OF_7 		128
#define POW_2_OF_4 		16


/* Function declaration */
void BH1750_ContinuousMode();
void BH1750_SendCommand(uint8_t cmd);
void BH1750_ReadData();


#endif
