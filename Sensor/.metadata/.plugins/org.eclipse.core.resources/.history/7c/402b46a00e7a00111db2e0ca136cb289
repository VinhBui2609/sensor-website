/*
 * BH1750.c
 *
 *  Created on: Jul 5, 2026
 *      Author: Bui Thanh Vinh
 */

#include "BH1750.h"
#include "i2c.h"

void BH1750_SendCommand(uint8_t cmd)
{
	HAL_I2C_Master_Transmit(&hi2c1, ADDR_LOW_ADDRESS_WRITE, &cmd, 1, HAL_MAX_DELAY);
}

